import { useState, useRef, useEffect } from 'react';
import { WebR } from '@r-wasm/webr';

export default function useCodeExecution() {
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Refs to store instances
    const pyodideRef = useRef(null);
    const webRRef = useRef(null);

    useEffect(() => {
        // Initialize WebR
        const initWebR = async () => {
            if (webRRef.current) return; // Prevent double init
            try {
                // Ensure we point to where the assets are served from
                const webR = new WebR({
                    baseUrl: '/',
                    serviceWorkerUrl: '/webr-serviceworker.js'
                });
                await webR.init();
                webRRef.current = webR;
                console.log('WebR Initialized');
            } catch (e) {
                console.error('Failed to init WebR', e);
                setOutput('Failed to initialize R environment: ' + e.message);
            }
        };
        initWebR();

        // Initialize Pyodide
        const initPyodide = async () => {
            if (pyodideRef.current) return; // Prevent double init
            try {
                if (window.loadPyodide) {
                    pyodideRef.current = await window.loadPyodide();
                    console.log('Pyodide Initialized');
                }
            } catch (e) {
                console.error('Failed to init Pyodide', e);
            }
        }
        initPyodide();

    }, []);

    const runCode = async (code, language) => {
        setIsLoading(true);
        setOutput('');

        try {
            if (language === 'javascript') {
                // Safe-ish eval using Function constructor and console capture
                let logs = [];
                const mockConsole = {
                    log: (...args) => logs.push(args.join(' ')),
                    error: (...args) => logs.push('[Error] ' + args.join(' ')),
                    warn: (...args) => logs.push('[Warn] ' + args.join(' '))
                };

                try {
                    // Wrap in a function
                    const fn = new Function('console', code);
                    fn(mockConsole);
                } catch (e) {
                    logs.push('Error: ' + e.message);
                }
                setOutput(logs.join('\n'));
            }

            else if (language === 'python') {
                if (!pyodideRef.current) {
                    setOutput('Python emulator not ready yet. Please wait...');
                    return;
                }
                // Redirect stdout
                pyodideRef.current.setStdout({ batched: (str) => setOutput((prev) => prev + str + '\n') });
                try {
                    await pyodideRef.current.runPythonAsync(code);
                } catch (e) {
                    setOutput('Error: ' + e.message);
                }
            }

            else if (language === 'r') {
                if (!webRRef.current) {
                    setOutput('R emulator not ready yet. Please wait...');
                    return;
                }
                try {
                    // Create a shelter to manage R objects
                    const shelter = await new webRRef.current.Shelter();
                    const result = await shelter.captureR(code, {
                        captureStreams: true,
                        captureConditions: true
                    });

                    // result.output is an array of objects
                    const outText = result.output.map(line => line.data).join('\n');
                    setOutput(outText);

                    await shelter.purge();
                } catch (e) {
                    setOutput('Error: ' + e.message);
                }
            }

            else {
                setOutput(`Execution for ${language} is not supported in browser-only mode yet.`);
            }

        } catch (err) {
            setOutput('Detailed Error: ' + err.toString());
        } finally {
            setIsLoading(false);
        }
    };

    return { runCode, output, isLoading };
}
