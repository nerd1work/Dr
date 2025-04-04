// دالة لتحميل الإحصاءات
async function loadStats() {
    const data = await fetchData();
    if (!data) return;
    
    // تحضير البيانات للرسوم البيانية
    prepareCharts(data);
    
    // تحميل قائمة المرضى الأكثر طلباً
    loadTopPatients(data);
    
    // تحميل قائمة المرضى الذين لم يطلبوا منذ مدة
    loadInactivePatients(data);
}

// دالة لتحضير الرسوم البيانية
function prepareCharts(data) {
    // إحصاءات الحالات المرضية
    const conditionsCount = {};
    data.patients.forEach(patient => {
        conditionsCount[patient.condition] = (conditionsCount[patient.condition] || 0) + 1;
    });
    
    const conditionsCtx = document.getElementById('conditions-chart').getContext('2d');
    new Chart(conditionsCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(conditionsCount),
            datasets: [{
                label: 'عدد المرضى حسب الحالة',
                data: Object.values(conditionsCount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // إحصاءات حالة الطلبات
    const statusCount = {
        pending: 0,
        approved: 0,
        rejected: 0
    };
    
    data.requests.forEach(request => {
        statusCount[request.status]++;
    });
    
    const statusCtx = document.getElementById('status-chart').getContext('2d');
    new Chart(statusCtx, {
        type: 'pie',
        data: {
            labels: ['معلقة', 'مقبولة', 'مرفوضة'],
            datasets: [{
                data: [statusCount.pending, statusCount.approved, statusCount.rejected],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// دالة لتحميل المرضى الأكثر طلباً
function loadTopPatients(data) {
    const patientRequestCount = {};
    
    data.requests.forEach(request => {
        patientRequestCount[request.patientId] = (patientRequestCount[request.patientId] || 0) + 1;
    });
    
    const patientsWithRequests = data.patients
        .filter(patient => patientRequestCount[patient.id])
        .map(patient => ({
            ...patient,
            requestCount: patientRequestCount[patient.id]
        }))
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 5);
    
    const topPatientsList = document.getElementById('top-patients-list');
    topPatientsList.innerHTML = '';
    
    patientsWithRequests.forEach(patient => {
        const patientItem = document.createElement('div');
        patientItem.className = 'patient-stat-item';
        patientItem.innerHTML = `
            <span>${patient.name}</span>
            <span>${patient.requestCount} طلبات</span>
        `;
        topPatientsList.appendChild(patientItem);
    });
}

// دالة لتحميل المرضى الذين لم يطلبوا منذ مدة
function loadInactivePatients(data) {
    const today = new Date();
    const inactivePatients = data.patients
        .filter(patient => {
            if (!patient.lastRequest) return true;
            const lastRequestDate = new Date(patient.lastRequest);
            const diffTime = Math.abs(today - lastRequestDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 30;
        })
        .sort((a, b) => {
            if (!a.lastRequest && !b.lastRequest) return 0;
            if (!a.lastRequest) return -1;
            if (!b.lastRequest) return 1;
            return new Date(a.lastRequest) - new Date(b.lastRequest);
        })
        .slice(0, 5);
    
    const inactivePatientsList = document.getElementById('inactive-patients-list');
    inactivePatientsList.innerHTML = '';
    
    inactivePatients.forEach(patient => {
        const patientItem = document.createElement('div');
        patientItem.className = 'patient-stat-item';
        patientItem.innerHTML = `
            <span>${patient.name}</span>
            <span>${patient.lastRequest ? `آخر طلب: ${patient.lastRequest}` : 'لم يطلب بعد'}</span>
        `;
        inactivePatientsList.appendChild(patientItem);
    });
}

// تحميل الإحصاءات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('stats-container')) {
        loadStats();
    }
});