const form = document.getElementById("form");
const list = document.getElementById("list");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const customCategoryInput = document.getElementById("customCategory");

let operations = JSON.parse(localStorage.getItem("operations")) || [];

let chart;

// показ поля "інше"
categoryInput.addEventListener("change", () => {
    if (categoryInput.value === "other") {
        customCategoryInput.style.display = "block";
    } else {
        customCategoryInput.style.display = "none";
        customCategoryInput.value = "";
    }
});

// додавання
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const amount = +amountInput.value;
    const type = typeInput.value;

    let category = categoryInput.value;
    if (category === "other") {
        category = customCategoryInput.value.trim() || "Інше";
    }

    if (!title) {
        alert("Введи назву");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Сума повинна бути більше 0");
        return;
    }

    const newOp = {
        id: Date.now(),
        title,
        amount,
        type,
        category
    };

    operations.push(newOp);
    save();
    render();

    form.reset();
    customCategoryInput.style.display = "none";
});

// збереження
function save() {
    localStorage.setItem("operations", JSON.stringify(operations));
}

// видалення
function deleteOperation(id, element) {
    element.classList.add("removing");

    setTimeout(() => {
        operations = operations.filter(op => op.id !== id);
        save();
        render();
    }, 200);
}

// рендер
function render() {
    list.innerHTML = "";

    let income = 0;
    let expense = 0;

    operations.forEach(op => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="left">
                ${op.title}
                <small>${op.category}</small>
            </div>

            <div class="right">
                <span>${op.amount} грн</span>
                <button class="delete-btn">✖</button>
            </div>
        `;

        li.querySelector("button").addEventListener("click", () => {
            deleteOperation(op.id, li);
        });

        list.appendChild(li);

        if (op.type === "income") income += op.amount;
        else expense += op.amount;
    });

    balanceEl.textContent = (income - expense) + " грн";
    incomeEl.textContent = income + " грн";
    expenseEl.textContent = expense + " грн";

    updateChart();
}

// графік
function updateChart() {
    const dataMap = {};

    operations
        .filter(op => op.type === "expense")
        .forEach(op => {
            dataMap[op.category] = (dataMap[op.category] || 0) + op.amount;
        });

    const labels = Object.keys(dataMap);
    const data = Object.values(dataMap);

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    "#3b82f6",
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6"
                ]
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: "#e2e8f0"
                    }
                }
            }
        }
    });
}

render();