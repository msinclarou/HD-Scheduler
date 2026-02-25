const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let currentEditingEmployeeId = null;

// Load employees from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
  loadEmployees();

  // Allow Enter key to add employee
  document.getElementById('employeeName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addEmployee();
    }
  });

  // Close modal when clicking outside of it
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('scheduleModal');
    if (e.target === modal) {
      closeScheduleModal();
    }
  });
});

function addEmployee() {
  const input = document.getElementById('employeeName');
  const name = input.value.trim();

  if (name === '') {
    alert('Please enter an employee name');
    return;
  }

  // Create employee object with default schedule
  const employee = {
    id: Date.now(),
    name: name,
    schedule: {
      Monday: { daysOff: false, hoursOff: [] },
      Tuesday: { daysOff: false, hoursOff: [] },
      Wednesday: { daysOff: false, hoursOff: [] },
      Thursday: { daysOff: false, hoursOff: [] },
      Friday: { daysOff: false, hoursOff: [] },
      Saturday: { daysOff: false, hoursOff: [] },
      Sunday: { daysOff: false, hoursOff: [] }
    }
  };

  // Get existing employees from localStorage
  let employees = JSON.parse(localStorage.getItem('employees')) || [];

  // Add new employee
  employees.push(employee);

  // Save to localStorage
  localStorage.setItem('employees', JSON.stringify(employees));

  // Clear input
  input.value = '';
  input.focus();

  // Refresh table
  loadEmployees();
}

function loadEmployees() {
  const tbody = document.getElementById('employeeList');
  const employees = JSON.parse(localStorage.getItem('employees')) || [];

  // Clear table
  tbody.innerHTML = '';

  if (employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="empty-message">No employees yet. Add one to get started!</td></tr>';
    return;
  }

  // Add each employee as a row
  employees.forEach((employee) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(employee.name)}</td>
      <td style="text-align: center;">
        <div class="action-buttons">
          <button class="edit-btn" onclick="openScheduleModal(${employee.id})">Edit</button>
          <button class="delete-btn" onclick="deleteEmployee(${employee.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openScheduleModal(employeeId) {
  const employees = JSON.parse(localStorage.getItem('employees')) || [];
  const employee = employees.find(e => e.id === employeeId);

  if (!employee) return;

  // Initialize schedule if it doesn't exist (for backward compatibility)
  if (!employee.schedule) {
    employee.schedule = {
      Monday: { daysOff: false, hoursOff: [] },
      Tuesday: { daysOff: false, hoursOff: [] },
      Wednesday: { daysOff: false, hoursOff: [] },
      Thursday: { daysOff: false, hoursOff: [] },
      Friday: { daysOff: false, hoursOff: [] },
      Saturday: { daysOff: false, hoursOff: [] },
      Sunday: { daysOff: false, hoursOff: [] }
    };
  }

  currentEditingEmployeeId = employeeId;
  document.getElementById('modalEmployeeName').textContent = employee.name;

  // Create day containers
  const daysContainer = document.getElementById('daysContainer');
  daysContainer.innerHTML = '';

  DAYS.forEach(day => {
    const dayData = employee.schedule[day] || { daysOff: false, hoursOff: [] };
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-container';

    const startTime = dayData.hoursOff[0] || '';
    const endTime = dayData.hoursOff[1] || '';

    dayDiv.innerHTML = `
      <div class="day-header">
        <input type="checkbox" id="dayOff_${day}" ${dayData.daysOff ? 'checked' : ''} onchange="toggleDayOff('${day}')">
        <label for="dayOff_${day}">${day}</label>
      </div>
      <div class="time-inputs ${dayData.daysOff ? '' : 'show'}" id="times_${day}">
        <div class="time-input-group">
          <label>Hours off from:</label>
          <input type="time" id="startTime_${day}" value="${startTime}" onchange="updateHours('${day}')">
        </div>
        <div class="time-input-group">
          <label>to:</label>
          <input type="time" id="endTime_${day}" value="${endTime}" onchange="updateHours('${day}')">
        </div>
      </div>
    `;

    daysContainer.appendChild(dayDiv);
  });

  // Show modal
  document.getElementById('scheduleModal').classList.add('show');
}

function closeScheduleModal() {
  document.getElementById('scheduleModal').classList.remove('show');
  currentEditingEmployeeId = null;
}

function toggleDayOff(day) {
  const checkbox = document.getElementById(`dayOff_${day}`);
  const timesDiv = document.getElementById(`times_${day}`);

  if (checkbox.checked) {
    timesDiv.classList.remove('show');
  } else {
    timesDiv.classList.add('show');
  }
}

function updateHours(day) {
  // This is called when time inputs change
  // We save in the saveSchedule function
}

function saveSchedule() {
  if (!currentEditingEmployeeId) return;

  const employees = JSON.parse(localStorage.getItem('employees')) || [];
  const employee = employees.find(e => e.id === currentEditingEmployeeId);

  if (!employee) return;

  // Update schedule for each day
  DAYS.forEach(day => {
    const isDayOff = document.getElementById(`dayOff_${day}`).checked;
    const startTime = document.getElementById(`startTime_${day}`).value;
    const endTime = document.getElementById(`endTime_${day}`).value;

    employee.schedule[day] = {
      daysOff: isDayOff,
      hoursOff: [startTime, endTime]
    };
  });

  // Save to localStorage
  localStorage.setItem('employees', JSON.stringify(employees));

  // Close modal and refresh
  closeScheduleModal();
  loadEmployees();
  alert('Schedule saved successfully!');
}

function deleteEmployee(id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    employees = employees.filter(emp => emp.id !== id);
    localStorage.setItem('employees', JSON.stringify(employees));
    loadEmployees();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
