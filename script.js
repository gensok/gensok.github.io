// Tasks are saved in the browser (localStorage), so they're still there after a refresh.
// Each task: { text, dueDate, completed, color }

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

	function renderTask(task) {
		const task_el = document.createElement('div');
		task_el.classList.add('task');
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

		const task_delete_el = document.createElement('button');
		task_delete_el.classList.add('delete');
		task_delete_el.innerText = 'Delete';

		task_actions_el.appendChild(task_edit_el);
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
