let students = [];
let nextId = 1;

const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
const formMessage = document.getElementById("formMessage");
const studentName = document.getElementById("studentName");
const rollNumber = document.getElementById("rollNumber");
const standard = document.getElementById("standard");
const english = document.getElementById("english");
const mathematics = document.getElementById("mathematics");
const science = document.getElementById("science");
const searchInput = document.getElementById("searchInput");
const resultFilter = document.getElementById("resultFilter");
const sortBy = document.getElementById("sortBy");

function calculateResult(student) {
    const total = student.english + student.mathematics + student.science;
    const percentage = (total / 300) * 100;
    let result = "Pass";
    if (
        student.english < 35 || student.mathematics < 35 || student.science < 35
    ) {
        result = "Fail";
    }
    return {
        ...student,
        total: total,
        percentage: percentage,
        result: result
    };
}
function validateStudent() {
    const name = studentName.value.trim();
    const roll = rollNumber.value.trim();
    if (name.length < 2) {
        return "Enter Students Name Properly.";
    }
    if (roll === "") {
        return "Please enter the roll number.";
    }
    const duplicate = students.find(function(student) {
        return student.rollNumber.toLowerCase() === roll.toLowerCase();
    });
    if (duplicate) {
        return "This roll number already exists.";
    }
    if (standard.value === "") {
        return "Please select a standard.";
    }
    const markInputs = [english, mathematics, science];
    for (let i = 0; i < markInputs.length; i++) {
        const mark = markInputs[i].value;
        if (mark === "") {
            return "Please enter all subject marks.";
        }
        if (
             Number(mark) < 0 || Number(mark) > 100
        ) {
            return "Marks must be whole numbers between 0 and 100.";
        }
    }
    return "";
}
studentForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const error = validateStudent();
    if (error !== "") {
        formMessage.textContent = error;
        formMessage.className = "mt-3 text-danger";
        return;
    }
    const student = {
        id: nextId++,
        name: studentName.value.trim(),
        rollNumber: rollNumber.value.trim(),
        standard: standard.value,
        english: Number(english.value),
        mathematics: Number(mathematics.value),
        science: Number(science.value)
    };
    students.push(student);
    formMessage.textContent = "Student added successfully!";
    formMessage.className = "mt-3 text-success";
    studentForm.reset();
    updateDashboard();
    displayStudents();
});
function getRankedStudents() {
    const results = students.map(function(student) {
        return calculateResult(student);
    });
    results.sort(function(a, b) {
        return b.percentage - a.percentage;
    });
    let currentRank = 0;
    for (let i = 0; i < results.length; i++) {
        if (i === 0 || results[i].percentage !== results[i - 1].percentage
        ) {
            currentRank = i + 1;
        }
        results[i].rank = currentRank;
    }
    return results;
}
function updateDashboard() {
    const results = students.map(function(student) {
        return calculateResult(student);
    });
    const totalStudents = results.length;
    document.getElementById("totalStudents").textContent =totalStudents;
    if (totalStudents === 0) {
        document.getElementById("classAverage").textContent = "0.00%";
        document.getElementById("passRate").textContent = "0%";
        document.getElementById("topPerformer").textContent ="Not Available";
        document.getElementById("topPercentage").textContent ="0.00%";
        return;
    }
    const totalPercentage = results.reduce(function(sum, student) {
        return sum + student.percentage;
    }, 0);
    const average = totalPercentage / totalStudents;
    document.getElementById("classAverage").textContent =
        average.toFixed(2) + "%";
    const passedStudents = results.filter(function(student) {
        return student.result === "Pass";
    });
    const passPercentage =
        (passedStudents.length / totalStudents) * 100;
    document.getElementById("passRate").textContent = passPercentage.toFixed(2).replace(/\.00$/, "") + "%"
    const topStudent = results.reduce(function(top, student) {
        if (student.percentage > top.percentage) {
            return student;
        }
        return top;
    });
    document.getElementById("topPerformer").textContent =
        topStudent.name;

    document.getElementById("topPercentage").textContent =
        topStudent.percentage.toFixed(2) + "%";
}
function displayStudents() {
    const rankedStudents = getRankedStudents();
    const searchText = searchInput.value.trim().toLowerCase();
    const filterValue = resultFilter.value;
    const sortValue = sortBy.value;
    let displayedStudents = rankedStudents.filter(function(student) {
        return student.name.toLowerCase().includes(searchText) ||
               student.rollNumber.toLowerCase().includes(searchText);
    });
    if (filterValue === "pass") {
        displayedStudents = displayedStudents.filter(function(student) {
            return student.result === "Pass";
        });
    } else if (filterValue === "fail") {
        displayedStudents = displayedStudents.filter(function(student) {
            return student.result === "Fail";
        });
    }
    if (sortValue === "name") {
        displayedStudents.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    } else if (sortValue === "high") {
        displayedStudents.sort(function(a, b) {
            return b.percentage - a.percentage;
        });
    } else if (sortValue === "low") {
        displayedStudents.sort(function(a, b) {
            return a.percentage - b.percentage;
        });
    } else if (sortValue === "roll") {
        displayedStudents.sort(function(a, b) {
            return a.rollNumber.localeCompare(
                b.rollNumber,
                undefined,
                { numeric: true, sensitivity: "base" }
            );
        });
    }
    studentTableBody.replaceChildren();
    if (displayedStudents.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 11;
        cell.className = "text-center py-5";
        const heading = document.createElement("h5");
        heading.textContent = students.length === 0
            ? "No Students Found"
            : "No Matching Students";
        const message = document.createElement("p");
        message.className = "text-muted mb-0";
        message.textContent = students.length === 0
            ? "Add a student to display the results."
            : "Try changing your search or filter.";
        cell.append(heading, message);
        row.appendChild(cell);
        studentTableBody.appendChild(row);
        return;
    }
    displayedStudents.forEach(function(student) {
        const row = document.createElement("tr");
        const values = [
            student.rank,
            student.name,
            student.rollNumber,
            student.standard + "th",
            student.english,
            student.mathematics,
            student.science,
            student.total,
            student.percentage.toFixed(2) + "%",
            student.result
        ];
        values.forEach(function(value, index) {
            const cell = document.createElement("td");
            cell.textContent = value;
            if (index === 9) {
                cell.className = student.result === "Pass"
                    ? "result-pass"
                    : "result-fail";
            }
            row.appendChild(cell);
        });
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-danger btn-sm delete-btn";
        deleteButton.addEventListener("click", function() {
            deleteStudent(student.id);
        });
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        studentTableBody.appendChild(row);
    });
}
function deleteStudent(id) {
    students = students.filter(function(student) {
        return student.id !== id;
    });
    updateDashboard();
    displayStudents();
    formMessage.textContent = "Student deleted successfully.";
    formMessage.className = "mt-3 text-success";
}
searchInput.addEventListener("input", displayStudents);
resultFilter.addEventListener("change", displayStudents);
sortBy.addEventListener("change", displayStudents);
studentForm.addEventListener("reset", function() {
    formMessage.textContent = "";
});
updateDashboard();
displayStudents();

