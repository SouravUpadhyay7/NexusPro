document.addEventListener('DOMContentLoaded', function() {
    // Task counter update function
    function updateTaskCounts() {
        const columns = document.querySelectorAll('.board-column');
        columns.forEach(column => {
            const taskCount = column.querySelector('.task-list').children.length;
            column.querySelector('.task-count').textContent = taskCount;
        });
    }

    // Modal functionality
    const modal = document.getElementById('taskModal');
    const addTaskBtn = document.querySelector('.add-task');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.querySelector('.cancel');
    const taskForm = document.getElementById('taskForm');

    // Open modal
    addTaskBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        taskForm.reset();
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        // Create a formatted date string
        const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Create new task element
        const newTask = document.createElement('div');
        newTask.className = 'task';
        newTask.setAttribute('draggable', 'true');
        newTask.setAttribute('data-task-id', Date.now()); // Unique ID
        
        newTask.innerHTML = `
            <div class="task-priority ${priority}"></div>
            <h4>${title}</h4>
            <p>${description}</p>
            <div class="task-meta">
                <span class="due-date"><i class="far fa-calendar"></i> ${formattedDate}</span>
                <div class="assigned-to">
                    <img src="/api/placeholder/30/30" alt="Assigned User">
                </div>
            </div>
        `;
        
        // Add to Todo column
        document.getElementById('todo').appendChild(newTask);
        
        // Update task counts
        updateTaskCounts();
        
        // Setup drag events for new task
        setupDragAndDrop(newTask);
        
        // Close modal
        closeModal();
        
        // Add glowing effect to show it's new
        newTask.style.boxShadow = '0 0 15px var(--red-glow)';
        setTimeout(() => {
            newTask.style.boxShadow = '';
        }, 2000);
    });

    // Drag and Drop Functionality
    let draggingTask = null;

    function setupDragAndDrop(taskElement) {
        taskElement.addEventListener('dragstart', handleDragStart);
        taskElement.addEventListener('dragend', handleDragEnd);
    }

    // Setup all existing tasks
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        setupDragAndDrop(task);
    });

    // Setup drop zones
    const taskLists = document.querySelectorAll('.task-list');
    taskLists.forEach(list => {
        list.addEventListener('dragover', handleDragOver);
        list.addEventListener('dragenter', handleDragEnter);
        list.addEventListener('dragleave', handleDragLeave);
        list.addEventListener('drop', handleDrop);
    });

    function handleDragStart(e) {
        draggingTask = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.getAttribute('data-task-id'));
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        taskLists.forEach(list => {
            list.classList.remove('drag-over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        // Only append if it's not the same container
        if (this !== draggingTask.parentNode) {
            this.appendChild(draggingTask);
            
            // If moving to completed column, add completed class
            if (this.id === 'completed') {
                draggingTask.classList.add('completed');
                const dueDate = draggingTask.querySelector('.due-date');
                dueDate.innerHTML = '<i class="far fa-calendar-check"></i> Completed';
            } else {
                // If moving from completed, remove completed class
                draggingTask.classList.remove('completed');
                
                // Check if we need to restore the due date
                if (draggingTask.querySelector('.due-date').textContent.includes('Completed')) {
                    // Just set a placeholder date
                    draggingTask.querySelector('.due-date').innerHTML = 
                        '<i class="far fa-calendar"></i> Apr 15, 2025';
                }
            }
            
            // Update task counts
            updateTaskCounts();
        }
        
        return false;
    }

    // Add hover effect to tasks
    tasks.forEach(task => {
        task.addEventListener('mouseenter', function() {
            if (!this.classList.contains('dragging')) {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            }
        });

        task.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
});
