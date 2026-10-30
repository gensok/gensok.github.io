// Tasks are saved in the browser (localStorage), so they're still there after a refresh.
// Each task: { text, dueDate, completed, color }. The saved list's order is the order on screen.
// Rename: the Rename button (or Enter) edits a task's text. Reorder: drag a task by its ⠿ handle.

const STORAGE_KEY = 'gens-todo-tasks';

function loadTasks() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
		return Array.isArray(saved) ? saved : [];
	} catch (err) {
		return [];
	}
}

function saveTasks(tasks) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	} catch (err) {
		// storage blocked (e.g. private mode) - the list still works, it just won't be remembered
	}
}

window.addEventListener('load', () => {
	const form = document.querySelector("#new-task-form");
	const input = document.querySelector("#new-task-input");
	const dueDateInput = document.getElementById('due-date-input');
	const list_el = document.querySelector("#tasks");
	const completedSound = document.getElementById("completed-sound");

	const tasks = loadTasks();
	const taskOf = new WeakMap(); // task element -> its task object

	function renderTask(task) {
		const task_el = document.createElement('div');
		task_el.classList.add('task');
		taskOf.set(task_el, task);

		// drag handle: grab here to move the task up or down the list
		const handle_el = document.createElement('span');
		handle_el.classList.add('drag-handle');
		handle_el.innerText = '⠿';
		handle_el.title = 'Drag to reorder';
		task_el.appendChild(handle_el);
		if (task.color) {
			task_el.style.backgroundColor = task.color;
		}

		const task_content_el = document.createElement('div');
		task_content_el.classList.add('content');

		task_el.appendChild(task_content_el);

		const task_input_el = document.createElement('input');
		task_input_el.classList.add('text');
		task_input_el.type = 'text';
		task_input_el.value = task.text;
		task_input_el.setAttribute('readonly', 'readonly');

		task_content_el.appendChild(task_input_el);

		const dueDateEl = document.createElement('span');
		dueDateEl.innerText = 'Due Date: ' + task.dueDate;
		task_content_el.appendChild(dueDateEl);

		const task_actions_el = document.createElement('div');
		task_actions_el.classList.add('actions');

		const task_edit_el = document.createElement('button');
		task_edit_el.classList.add('completeaction');

		const task_color_el = document.createElement('input');
		task_color_el.type = 'color';
		task_color_el.classList.add('color-picker');
		task_color_el.value = task.color || '#eeeeee';
		task_color_el.addEventListener('input', (e) => {
			task_el.style.backgroundColor = e.target.value;
			task.color = e.target.value;
			saveTasks(tasks);
		});

		const task_rename_el = document.createElement('button');
		task_rename_el.classList.add('rename');
		task_rename_el.innerText = 'Rename';

		const task_delete_el = document.createElement('button');
		task_delete_el.classList.add('delete');
		task_delete_el.innerText = 'Delete';

		task_actions_el.appendChild(task_edit_el);
		task_actions_el.appendChild(task_rename_el);
		task_actions_el.appendChild(task_delete_el);
		task_actions_el.appendChild(task_color_el);

		task_el.appendChild(task_actions_el);

		list_el.appendChild(task_el);

		function showCompleted() {
			if (task.completed) {
				task_edit_el.innerText = "Completed!";
				task_input_el.classList.add('strikethrough');
				task_edit_el.classList.add('completed-color');
			} else {
				task_edit_el.innerText = "Incomplete";
				task_input_el.classList.remove('strikethrough');
				task_edit_el.classList.remove('completed-color');
			}
		}
		showCompleted();

		task_edit_el.addEventListener('click', () => {
			task.completed = !task.completed;
			if (task.completed) {
				completedSound.play();
			}
			showCompleted();
			saveTasks(tasks);
		});

		// rename ---------------------------------------------------------------
		let renaming = false;
		function startRename() {
			renaming = true;
			task_input_el.removeAttribute('readonly');
			task_input_el.focus();
			task_input_el.select();
			task_rename_el.innerText = 'Save';
		}
		function finishRename() {
			if (!renaming) return;
			renaming = false;
			const newText = task_input_el.value.trim();
			if (newText === '') {
				task_input_el.value = task.text; // empty name: keep the old one
			} else {
				task.text = newText;
				task_input_el.value = newText;
				saveTasks(tasks);
			}
			task_input_el.setAttribute('readonly', 'readonly');
			task_rename_el.innerText = 'Rename';
		}
		// keep the text box focused when the Save button is pressed (so blur doesn't fire first)
		task_rename_el.addEventListener('pointerdown', (e) => {
			if (renaming) e.preventDefault();
		});
		task_rename_el.addEventListener('click', () => {
			if (renaming) finishRename(); else startRename();
		});
		task_input_el.addEventListener('keydown', (e) => {
			if (!renaming) return;
			if (e.key === 'Enter') {
				finishRename();
			} else if (e.key === 'Escape') {
				task_input_el.value = task.text; // cancel
				finishRename();
			}
		});
		task_input_el.addEventListener('blur', finishRename);

		task_delete_el.addEventListener('click', () => {
			list_el.removeChild(task_el);
			const index = tasks.indexOf(task);
			if (index !== -1) {
				tasks.splice(index, 1);
			}
			saveTasks(tasks);
		});
	}

	// put back everything that was saved
	tasks.forEach(renderTask);

	// drag to reorder (SortableJS: works with a mouse and on touch screens)
	if (window.Sortable) {
		Sortable.create(list_el, {
			handle: '.drag-handle',
			animation: 150,
			ghostClass: 'task-ghost',
			onEnd: () => {
				// the saved order follows the order on screen
				const ordered = [];
				list_el.querySelectorAll('.task').forEach((el) => {
					const t = taskOf.get(el);
					if (t) ordered.push(t);
				});
				tasks.length = 0;
				tasks.push(...ordered);
				saveTasks(tasks);
			},
		});
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const task = {
			text: input.value,
			dueDate: dueDateInput.value,
			completed: false,
			color: '',
		};

		tasks.push(task);
		saveTasks(tasks);
		renderTask(task);

		input.value = '';
	});
});
