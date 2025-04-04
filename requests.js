// دالة لتحميل الطلبات
async function loadRequests() {
    const data = await fetchData();
    if (!data) return;
    
    const requestsContainer = document.getElementById('requests-container');
    if (!requestsContainer) return;
    
    requestsContainer.innerHTML = '';
    
    const filterValue = document.getElementById('request-filter')?.value;
    
    const filteredRequests = data.requests.filter(request => {
        if (filterValue === 'all') return true;
        return request.status === filterValue;
    });
    
    // فرز الطلبات بحيث تكون المعلقة أولاً
    filteredRequests.sort((a, b) => {
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
        return new Date(b.date) - new Date(a.date);
    });
    
    filteredRequests.forEach(request => {
        const patient = data.patients.find(p => p.id === request.patientId);
        if (!patient) return;
        
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        requestCard.innerHTML = `
            <div class="request-status status-${request.status}">
                ${request.status === 'pending' ? 'معلق' : request.status === 'approved' ? 'مقبول' : 'مرفوض'}
            </div>
            <h3>${patient.name}</h3>
            <div class="patient-info">
                <p>الحالة: ${patient.condition}</p>
                <p>تاريخ الطلب: ${request.date}</p>
                <p>المواد المطلوبة: ${request.items.join('، ')}</p>
                <p>عدد العناصر: ${request.items.length}</p>
            </div>
            ${request.status === 'pending' ? `
            <div class="request-actions">
                <button class="approve-btn" onclick="updateRequestStatus(${request.id}, 'approved')">قبول</button>
                <button class="reject-btn" onclick="updateRequestStatus(${request.id}, 'rejected')">رفض</button>
            </div>
            ` : ''}
        `;
        requestsContainer.appendChild(requestCard);
    });
}

// دالة لتحديث حالة الطلب
async function updateRequestStatus(requestId, status) {
    const data = await fetchData();
    if (!data) return;
    
    const requestIndex = data.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) return;
    
    data.requests[requestIndex].status = status;
    
    await saveData(data);
    loadRequests();
}

// تحميل الطلبات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('requests-container')) {
        loadRequests();
        
        // إضافة مستمع حدث لعنصر التصفية
        document.getElementById('request-filter')?.addEventListener('change', loadRequests);
    }
});