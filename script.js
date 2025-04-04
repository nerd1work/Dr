// دالة لجلب البيانات من ملف JSON
async function fetchData() {
    try {
        const response = await fetch('db.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// دالة لحفظ البيانات في ملف JSON
async function saveData(data) {
    // في بيئة حقيقية، هنا ستكون هناك طلب إلى الخادم لحفظ البيانات
    // لكن في هذا المثال، سنستخدم localStorage لمحاكاة الحفظ
    localStorage.setItem('patientRequestsDB', JSON.stringify(data));
    console.log('Data saved successfully');
}

// دالة لتحميل قائمة المرضى
async function loadPatients() {
    const data = await fetchData();
    if (!data) return;
    
    const patientsContainer = document.getElementById('patients-container');
    if (!patientsContainer) return;
    
    patientsContainer.innerHTML = '';
    
    const conditionFilter = document.getElementById('condition-filter')?.value;
    const priorityFilter = document.getElementById('priority-filter')?.value;
    const searchTerm = document.getElementById('search')?.value.toLowerCase();
    
    const filteredPatients = data.patients.filter(patient => {
        const matchesCondition = !conditionFilter || patient.condition === conditionFilter;
        const matchesPriority = !priorityFilter || patient.priority === priorityFilter;
        const matchesSearch = !searchTerm || 
            patient.name.toLowerCase().includes(searchTerm) || 
            patient.condition.toLowerCase().includes(searchTerm);
        
        return matchesCondition && matchesPriority && matchesSearch;
    });
    
    filteredPatients.forEach(patient => {
        const patientCard = document.createElement('div');
        patientCard.className = 'patient-card';
        patientCard.innerHTML = `
            <h3>${patient.name}</h3>
            <div class="patient-info">
                <p>العمر: ${patient.age}</p>
                <p>الحالة: ${patient.condition}</p>
                <p class="priority-${patient.priority === 'عالي' ? 'high' : patient.priority === 'متوسط' ? 'medium' : 'low'}">
                    الأولوية: ${patient.priority}
                </p>
                <p>آخر طلب: ${patient.lastRequest || 'لا يوجد'}</p>
            </div>
            <button class="request-btn" onclick="showRequestForm(${patient.id}, '${patient.name}')">تقديم طلب</button>
        `;
        patientsContainer.appendChild(patientCard);
    });
}

// دالة لعرض نموذج الطلب
function showRequestForm(patientId, patientName) {
    document.getElementById('patient-id').value = patientId;
    document.getElementById('patient-name').value = patientName;
    document.getElementById('request-form').style.display = 'block';
    window.scrollTo({
        top: document.getElementById('request-form').offsetTop,
        behavior: 'smooth'
    });
}

// دالة لإلغاء الطلب
function cancelRequest() {
    document.getElementById('request-form').style.display = 'none';
    document.getElementById('new-request-form').reset();
}

// دالة للبحث عن المرضى
function searchPatients() {
    loadPatients();
}

// دالة لتقديم طلب جديد
document.getElementById('new-request-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patient-id').value);
    const items = document.getElementById('request-items').value.split(',').map(item => item.trim());
    const itemCount = parseInt(document.getElementById('item-count').value);
    
    const data = await fetchData();
    if (!data) return;
    
    // إنشاء طلب جديد
    const newRequest = {
        id: data.requests.length > 0 ? Math.max(...data.requests.map(r => r.id)) + 1 : 1,
        patientId: patientId,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        items: items
    };
    
    // تحديث بيانات المريض
    const patientIndex = data.patients.findIndex(p => p.id === patientId);
    if (patientIndex !== -1) {
        data.patients[patientIndex].lastRequest = newRequest.date;
    }
    
    // إضافة الطلب الجديد
    data.requests.push(newRequest);
    
    // حفظ البيانات
    await saveData(data);
    
    // إعادة تحميل الصفحة
    alert('تم تقديم الطلب بنجاح!');
    document.getElementById('new-request-form').reset();
    document.getElementById('request-form').style.display = 'none';
    loadPatients();
});

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات المحفوظة من localStorage إذا وجدت
    const savedData = localStorage.getItem('patientRequestsDB');
    if (savedData) {
        console.log('Loaded data from localStorage');
    }
    
    // تحميل البيانات المناسبة للصفحة الحالية
    if (document.getElementById('patients-container')) {
        loadPatients();
        
        // إضافة مستمعات للأحداث للتصفية
        document.getElementById('condition-filter')?.addEventListener('change', loadPatients);
        document.getElementById('priority-filter')?.addEventListener('change', loadPatients);
        document.getElementById('search')?.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') loadPatients();
        });
    }
});