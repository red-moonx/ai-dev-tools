from django.contrib import admin
from .models import Todo

# Register your models here.

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'due_date', 'is_resolved', 'created_at')
    list_filter = ('is_resolved', 'priority', 'due_date')
    search_fields = ('title', 'description')
    list_editable = ('is_resolved',)
