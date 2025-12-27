const fs = require('fs');
const TASK_FILE = 'tasks.json'; // Изменили с package.json, чтобы не ломать проект

//-----------------------------------
// ФУНКЦИЯ ЗАГРУЗКИ ЗАДАЧ
//-----------------------------------
function loadTasks() {
    try {
        if (fs.existsSync(TASK_FILE)) {
            const data = fs.readFileSync(TASK_FILE, "utf-8");
            // Проверяем, не пустой ли файл, прежде чем парсить
            return data ? JSON.parse(data) : [];
        }
        return [];
    } catch (error) {
        console.log('Ошибка загрузки задач:', error.message);
        return [];
    }
}

//-----------------------------------
// ФУНКЦИЯ СОХРАНЕНИЯ ЗАДАЧ В ФАЙЛ
//-----------------------------------
function saveTasks(tasks) {
    try {
        const jsonData = JSON.stringify(tasks, null, 2);
        fs.writeFileSync(TASK_FILE, jsonData, 'utf8');
        console.log('Задачи успешно сохранены');
    } catch (error) {
        console.log('Ошибка сохранения задач:', error.message);
    }
}

//-----------------------------------
// ФУНКЦИЯ ДЛЯ ПОКАЗА ВСЕХ ЗАДАЧ
//-----------------------------------
function showTasks(tasks) {
    if (tasks.length === 0) {
        console.log('Ваш список задач пуст');
        return;
    }
    console.log('\n=== ВАШИ ЗАДАЧИ ===');
    tasks.forEach((task, index) => {
        const status = task.completed ? '[X]' : '[]';
        const number = index + 1;
        console.log(`${number}.${status} ${task.title}`);
        if (task.description) {
            console.log(` Описание: ${task.description}`);
        }
        console.log(` Создана: ${task.createdAt}`); // Исправлено: createdAt
        console.log(' ---');
    });
}

//-----------------------------------
// ФУНКЦИЯ ДОБАВЛЕНИЯ ЗАДАЧИ
//-----------------------------------
async function addTask(tasks) {
    console.log('\n=== ДОБАВЛЕНИЕ НОВОЙ ЗАДАЧИ ===');
    const title = await getUserinput('Введите название задачи: ');
    if (!title.trim()) {
        console.log('Название задачи не может быть пустым!');
        return tasks;
    }
    const description = await getUserinput('Введите описание (необязательно): ');
    const newTask = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: new Date().toLocaleString() // Исправлено: createdAt
    };
    console.log(`Задача "${newTask.title}" добавлена!`); // Исправлено: newTask.title
    return [...tasks, newTask];
}

//-----------------------------------
// ФУНКЦИЯ ОТМЕТКИ ЗАДАЧИ КАК ВЫПОЛНЕННОЙ
//-----------------------------------
async function completeTask(tasks) {
    if (tasks.length === 0) {
        console.log('Нет задач для отметки.');
        return tasks;
    }

    showTasks(tasks);
    console.log('\n=== ОТМЕТКА ЗАДАЧИ ВЫПОЛНЕННОЙ ===');
    const input = await getUserinput('Введите номер задачи: '); // Исправлено: добавлен await
    const taskNumber = parseInt(input); // Исправлено: parseInt (большая I)

    if (isNaN(taskNumber) || taskNumber < 1 || taskNumber > tasks.length) { // Исправлено: tasks.length
        console.log('Неверный номер задачи!');
        return tasks;
    }

    const updatedTasks = tasks.map((task, index) => { // Исправлено: tasks.map
        if (index === taskNumber - 1) {
            if (task.completed) {
                console.log('Эта задача уже выполнена!');
                return task;
            }
            console.log(`Задача "${task.title}" отмечена выполненной.`);
            return {
                ...task,
                completed: true,
                completedAt: new Date().toLocaleString()
            };
        }
        return task; // Исправлено: возвращаем конкретный task
    });

    return updatedTasks;
}

//-----------------------------------
// ФУНКЦИЯ УДАЛЕНИЯ ЗАДАЧИ
//-----------------------------------
async function deleteTask(tasks) {
    if (tasks.length === 0) {
        console.log('Нет задач для удаления.');
        return tasks;
    }

    showTasks(tasks);
    console.log('\n=== УДАЛЕНИЕ ЗАДАЧИ ===');

    const input = await getUserinput('Введите номер задачи: ');
    const taskNumber = parseInt(input);

    if (isNaN(taskNumber) || taskNumber > tasks.length || taskNumber < 1) { // Исправлено: tasks.length
        console.log('Неверный номер задачи!');
        return tasks;
    }

    const taskToDelete = tasks[taskNumber - 1];
    const raw = await getUserinput(`Удалить "${taskToDelete.title}"? (y/n): `);
    const confirm = (raw || '').trim().toLowerCase();

    if (['y', 'yes', 'да'].includes(confirm)) {
        const updatedTasks = tasks.filter((_, index) => index !== taskNumber - 1); // Исправлено: логика filter
        console.log('Задача удалена.');
        return updatedTasks;
    } else {
        console.log('Удаление отменено');
        return tasks;
    }
}

//-----------------------------------
// ФУНКЦИЯ ПОКАЗА СТАТИСТИКИ
//-----------------------------------
function showStatistics(tasks) {
    console.log('\n=== СТАТИСТИКА ===');

    const total = tasks.length; // Исправлено: tasks.length
    const completed = tasks.filter(t => t.completed).length; // Исправлено: tasks.filter
    const pending = total - completed;

    console.log(`Всего: ${total}`);
    console.log(`Выполнено: ${completed}`);
    console.log(`Осталось: ${pending}`);

    const status = total > 0
        ? `Прогресс: ${Math.round((completed / total) * 100)}%`
        : 'Начните выполнять задачи!';

    console.log(status);
}

//-----------------------------------
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
//-----------------------------------

function getUserinput(prompt) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(prompt, (input) => {
            readline.close();
            resolve(input);
        });
    });
}

function generateId() {
    return Date.now().toString();
}

//-----------------------------------
// ГЛАВНОЕ МЕНЮ
//-----------------------------------

function showMenu() {
    console.log('\n=== МЕНЕДЖЕР ЗАДАЧ ===');
    console.log('1. Показать задачи');
    console.log('2. Добавить задачу');
    console.log('3. Отметить выполненной');
    console.log('4. Удалить задачу');
    console.log('5. Статистика');
    console.log('6. Выход');
}

//-----------------------------------
// ОСНОВНАЯ ФУНКЦИЯ ПРОГРАММЫ
//-----------------------------------
async function main() {
    console.log('Добро пожаловать!');

    let tasks = loadTasks();
    let isRunning = true;

    while (isRunning) {
        showMenu();
        const choice = await getUserinput('Выберите действие (1–6): ');

        switch (choice) {
            case '1':
                showTasks(tasks);
                break;
            case '2':
                tasks = await addTask(tasks);
                saveTasks(tasks);
                break;
            case '3':
                tasks = await completeTask(tasks);
                saveTasks(tasks);
                break;
            case '4':
                tasks = await deleteTask(tasks);
                saveTasks(tasks);
                break;
            case '5':
                showStatistics(tasks);
                break;
            case '6':
                console.log('До свидания!');
                isRunning = false;
                break;
            default:
                console.log('Введите число от 1 до 6.');
        }
    }
}

main().catch(err => console.log('Ошибка:', err));
