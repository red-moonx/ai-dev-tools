from django.test import TestCase, Client
from django.urls import reverse
from datetime import date, timedelta
from .models import Todo


class TodoTestCase(TestCase):
    """Test suite for TODO application"""
    
    def setUp(self):
        """Set up test client and sample data"""
        self.client = Client()
        
    def test_create_todo(self):
        """Test creating a TODO"""
        # Create a TODO with all fields
        response = self.client.post(reverse('todo_create'), {
            'title': 'Test TODO',
            'description': 'This is a test TODO',
            'due_date': date.today() + timedelta(days=7),
            'priority': 'high'
        })
        
        # Check redirect after creation
        self.assertEqual(response.status_code, 302)
        
        # Verify TODO was created in database
        self.assertEqual(Todo.objects.count(), 1)
        
        # Check TODO has correct attributes
        todo = Todo.objects.first()
        self.assertEqual(todo.title, 'Test TODO')
        self.assertEqual(todo.description, 'This is a test TODO')
        self.assertEqual(todo.priority, 'high')
        self.assertFalse(todo.is_resolved)
        
    def test_create_todo_minimal_fields(self):
        """Test creating a TODO with only required fields"""
        response = self.client.post(reverse('todo_create'), {
            'title': 'Minimal TODO',
            'description': '',
            'priority': 'medium'
        })
        
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), 1)
        
        todo = Todo.objects.first()
        self.assertEqual(todo.title, 'Minimal TODO')
        self.assertEqual(todo.description, '')
        self.assertIsNone(todo.due_date)
        
    def test_list_todos(self):
        """Test listing TODOs"""
        # Create multiple TODOs
        Todo.objects.create(
            title='First TODO',
            description='First description',
            priority='high'
        )
        Todo.objects.create(
            title='Second TODO',
            description='Second description',
            priority='low',
            is_resolved=True
        )
        Todo.objects.create(
            title='Third TODO',
            priority='medium'
        )
        
        # Get the list page
        response = self.client.get(reverse('todo_list'))
        
        # Check response
        self.assertEqual(response.status_code, 200)
        
        # Verify all TODOs are in context
        todos = response.context['todos']
        self.assertEqual(len(todos), 3)
        
        # Check that resolved and unresolved TODOs both appear
        resolved_count = sum(1 for todo in todos if todo.is_resolved)
        unresolved_count = sum(1 for todo in todos if not todo.is_resolved)
        self.assertEqual(resolved_count, 1)
        self.assertEqual(unresolved_count, 2)
        
    def test_list_todos_empty(self):
        """Test listing TODOs when there are none"""
        response = self.client.get(reverse('todo_list'))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['todos']), 0)
        
    def test_mark_as_resolved(self):
        """Test marking a TODO as resolved"""
        # Create an unresolved TODO
        todo = Todo.objects.create(
            title='TODO to resolve',
            description='This will be marked as resolved',
            priority='medium'
        )
        
        self.assertFalse(todo.is_resolved)
        
        # Mark as resolved using toggle view
        response = self.client.get(reverse('todo_toggle', args=[todo.id]))
        
        # Check redirect
        self.assertEqual(response.status_code, 302)
        
        # Verify TODO is now resolved
        todo.refresh_from_db()
        self.assertTrue(todo.is_resolved)
        
    def test_toggle_resolved_status(self):
        """Test toggling resolved status back and forth"""
        # Create a resolved TODO
        todo = Todo.objects.create(
            title='Resolved TODO',
            priority='low',
            is_resolved=True
        )
        
        # Toggle to unresolved
        self.client.get(reverse('todo_toggle', args=[todo.id]))
        todo.refresh_from_db()
        self.assertFalse(todo.is_resolved)
        
        # Toggle back to resolved
        self.client.get(reverse('todo_toggle', args=[todo.id]))
        todo.refresh_from_db()
        self.assertTrue(todo.is_resolved)
        
    def test_delete_todo(self):
        """Test deleting a TODO"""
        # Create a TODO
        todo = Todo.objects.create(
            title='TODO to delete',
            description='This will be deleted',
            priority='urgent'
        )
        
        self.assertEqual(Todo.objects.count(), 1)
        
        # Delete the TODO
        response = self.client.post(reverse('todo_delete', args=[todo.id]))
        
        # Check redirect
        self.assertEqual(response.status_code, 302)
        
        # Verify TODO was deleted
        self.assertEqual(Todo.objects.count(), 0)
        
    def test_delete_multiple_todos(self):
        """Test that deleting one TODO doesn't affect others"""
        # Create multiple TODOs
        todo1 = Todo.objects.create(title='Keep this', priority='high')
        todo2 = Todo.objects.create(title='Delete this', priority='low')
        todo3 = Todo.objects.create(title='Also keep this', priority='medium')
        
        self.assertEqual(Todo.objects.count(), 3)
        
        # Delete only the second TODO
        self.client.post(reverse('todo_delete', args=[todo2.id]))
        
        # Verify only one was deleted
        self.assertEqual(Todo.objects.count(), 2)
        
        # Verify the correct TODOs remain
        remaining_titles = [todo.title for todo in Todo.objects.all()]
        self.assertIn('Keep this', remaining_titles)
        self.assertIn('Also keep this', remaining_titles)
        self.assertNotIn('Delete this', remaining_titles)
