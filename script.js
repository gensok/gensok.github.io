

window.addEventListener('load', () => {
	const form = document.querySelector("#new-task-form");
	const input = document.querySelector("#new-task-input");
	const list_el = document.querySelector("#tasks");
	const completedSound = document.getElementById("completed-sound");

	

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const task = input.value;
		const dueDate = document.getElementById('due-date-input').value;

		const task_el = document.createElement('div');
		task_el.classList.add('task');

		const task_content_el = document.createElement('div');
		task_content_el.classList.add('content');

		task_el.appendChild(task_content_el);

		const task_input_el = document.createElement('input');
		task_input_el.classList.add('text');
		task_input_el.type = 'text';
		task_input_el.value = task;
		task_input_el.setAttribute('readonly', 'readonly');

		task_content_el.appendChild(task_input_el);

		const task_actions_el = document.createElement('div');
		task_actions_el.classList.add('actions');
		
		const task_edit_el = document.createElement('button');
		task_edit_el.classList.add('completeaction');
		task_edit_el.innerText = 'incomplete';

		const task_color_el = document.createElement('input');
		task_color_el.type = 'color';
		task_color_el.classList.add('color-picker');
		task_color_el.value = 'EEE'; 
		task_color_el.addEventListener('input', (e) => {
    	task_el.style.backgroundColor = e.target.value;
		});

		

		const dueDateEl = document.createElement('span');
        dueDateEl.innerText = 'Due Date: ' + dueDate;
        task_content_el.appendChild(dueDateEl);

		const task_delete_el = document.createElement('button');
		task_delete_el.classList.add('delete');
		task_delete_el.innerText = 'Delete';

		task_actions_el.appendChild(task_edit_el);
		task_actions_el.appendChild(task_delete_el);
		task_actions_el.appendChild(task_color_el);
		

		task_el.appendChild(task_actions_el);

		list_el.appendChild(task_el);

		input.value = '';

		task_edit_el.addEventListener('click', (e) => {
			if (task_edit_el.innerText.toLowerCase() == "incomplete") {
				task_edit_el.innerText = "Completed!";
				task_input_el.classList.add('strikethrough');
				task_edit_el.classList.add('completed-color');
				completedSound.play();

			} else {
				task_edit_el.innerText = "Incomplete";
				task_input_el.classList.remove('strikethrough');
				task_edit_el.classList.remove('completed-color');
			
			}
		});

		task_delete_el.addEventListener('click', (e) => {
			list_el.removeChild(task_el);
		});
	});
	
});

