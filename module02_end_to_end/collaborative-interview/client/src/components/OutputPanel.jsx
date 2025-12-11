import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function OutputPanel({ output }) {
    // Actually simplicity might be better than xterm for just showing text output
    // Xterm is good for streaming but here we just show execution result?
    // User asked for "Output Panel".
    // I'll use a simple pre div for now as I just get a string back.
    // Xterm is overkill if I don't have a PTY.

    return (
        <div className="output-panel">
            <div className="panel-header">Output</div>
            <div className="terminal-output">
                {output || "Run code to see output..."}
            </div>
        </div>
    );
}
