// script.js

document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splashScreen');
    const yearSelectionScreen = document.getElementById('yearSelectionScreen');
    const mainApp = document.getElementById('mainApp');

    const yearSelect = document.getElementById('yearSelect'); // ملاحظة: ID هو yearSelect وليس year-select
    const selectYearButton = document.getElementById('selectYearButton');

    const searchInput = document.getElementById('searchInput'); // ملاحظة: ID هو searchInput وليس search-input
    const searchButton = document.getElementById('searchButton');
    const resultContainer = document.getElementById('resultContainer');
    const loader = document.getElementById('loader');

    const splashDuration = 6000; // 6 ثواني (مدة عرض شاشة الترحيب)
    const fadeDuration = 700; // 0.7 ثانية (مدة التلاشي لكل من الشاشات)

    // روابط Google Sheets لكل سنة
    // *** مهم: تأكد من تحديث معرفات الجداول هنا بالمعرفات الفعلية الخاصة بك ***
    const googleSheetURLs = {
        '2023': 'ادخل_معرف_جدول_2023_هنا', // استبدل بـ ID جدول 2023 الفعلي إذا كان لديك
        '2024': '2PACX-1vRw4ljKLLPdOc-yOGjkC89GYD7WrfPao-PlO2-dD8q-sto-doSdOPtvLQq92OmO-5qGCiBIN1mVBQOf', // الرابط الجديد لجدول 2024
        '2025': '2PACX-1vS0GyVjy3mFDxzGOyVpe42J1S-5C1yl5J7PAk1KDXU21cRHr-CQqI4wOgvznq4kZGTq6wxzPgYvmxuX', // رابط جدول 2025 الحالي (الذي قدمته أنت)
        '2026': 'ادخل_معرف_جدول_2026_هنا', // استبدل بـ ID جدول 2026 الفعلي إذا كان لديك
        '2027': 'ادخل_معرف_جدول_2027_هنا'  // استبدل بـ ID جدول 2027 الفعلي إذا كان لديك
    };

    let currentGoogleSheetURL = ''; // المتغير الذي سيحتفظ بالرابط الحالي للجدول بناءً على السنة المختارة

    // منطق شاشة الترحيب والانتقال إلى شاشة اختيار السنة
    if (splashScreen && yearSelectionScreen && mainApp) {
        setTimeout(() => {
            splashScreen.classList.add('hidden'); // إخفاء شاشة الترحيب بالتدريج

            setTimeout(() => {
                splashScreen.style.display = 'none'; // إخفائها تمامًا بعد التلاشي
                yearSelectionScreen.classList.add('visible-screen'); // إظهار شاشة اختيار السنة بالتدريج
            }, fadeDuration);
        }, splashDuration);

    } else {
        console.error("شاشة الترحيب (splashScreen) أو شاشة اختيار السنة (yearSelectionScreen) أو التطبيق الرئيسي (mainApp) غير موجودين في HTML. تأكد من صحة معرفات العناصر.");
        // إذا لم يتم العثور على أي من الشاشات، أظهر التطبيق الرئيسي مباشرة
        if (mainApp) {
            mainApp.style.visibility = 'visible';
            mainApp.style.opacity = '1';
        }
    }

    // معالجة اختيار السنة عند النقر على زر "تأكيد"
    if (selectYearButton && yearSelect) {
        selectYearButton.addEventListener('click', () => {
            const selectedYear = yearSelect.value;
            // بناء الرابط بالاعتماد على معرف السنة من googleSheetURLs
            const sheetId = googleSheetURLs[selectedYear];
            if (sheetId && !sheetId.includes('ادخل_معرف_جدول_')) { // تأكد أن المعرف ليس فارغًا أو افتراضيًا
                currentGoogleSheetURL = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
                
                yearSelectionScreen.classList.add('hidden'); // إخفاء شاشة اختيار السنة
                setTimeout(() => {
                    yearSelectionScreen.style.display = 'none';
                    mainApp.classList.add('visible-app'); // إظهار شاشة التطبيق الرئيسي
                }, fadeDuration);
            } else {
                alert('الرجاء اختيار سنة صالحة أو التأكد من ربط الجدول لهذه السنة في الكود.');
                console.warn(`المعرف الخاص بسنة ${selectedYear} إما غير موجود أو لم يتم تحديثه في googleSheetURLs.`);
            }
        });
    } else {
        console.error("عناصر اختيار السنة (الزر 'selectYearButton' أو الـ 'yearSelect') غير موجودة في HTML. تأكد من صحة معرفات العناصر.");
    }

    // --- كود البحث (تم تعديله للبحث في العمود A كما كان في الكود الأصلي) ---
    if (searchButton && searchInput && resultContainer && loader) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            resultContainer.innerHTML = ''; // مسح النتائج السابقة

            if (!searchTerm) {
                resultContainer.innerHTML = '<p class="not-found">الرجاء إدخال رقم للبحث.</p>';
                return;
            }

            if (!currentGoogleSheetURL) {
                resultContainer.innerHTML = '<p class="not-found">الرجاء اختيار السنة أولاً.</p>';
                return;
            }

            loader.style.display = 'block'; // إظهار اللودر

            fetch(currentGoogleSheetURL) // استخدام الرابط المحدد بناءً على اختيار السنة
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`فشل في جلب البيانات من الجدول: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(csvData => {
                    loader.style.display = 'none'; // إخفاء اللودر
                    
                    // نقوم بتخطي الصف الأول (رؤوس الأعمدة) إذا كنت تريد ذلك
                    // إذا كان جدولك لا يحتوي على رؤوس، احذف .slice(1)
                    const rows = csvData.split('\n').slice(1).filter(row => row.trim() !== ''); // تصفية الصفوف الفارغة

                    let found = false;
                    let resultsHTML = '';

                    rows.forEach(row => {
                        const columns = row.split(',');
                        // القيمة في العمود A (الفهرس 0)
                        const valueA = columns[0] ? columns[0].trim() : '';

                        // نقوم بالبحث عن الرقم المدخل في العمود A
                        if (valueA === searchTerm) {
                            found = true;
                            // قيم العمود B (الفهرس 1) وقيمة العمود C (الفهرس 2)
                            const valueB = columns[1] ? columns[1].trim() : '';
                            const valueC = columns[2] ? columns[2].trim() : '';

                            if (valueB || valueC) { // تأكد أن هناك قيمة في B أو C قبل العرض
                                if (valueB && valueC) {
                                    resultsHTML += `<p>${valueB} ← ${valueC}</p>`;
                                } else if (valueB) {
                                    resultsHTML += `<p>${valueB}</p>`;
                                } else if (valueC) {
                                    resultsHTML += `<p>${valueC}</p>`;
                                }
                            } else {
                                resultsHTML += `<p class="not-found">لا توجد بيانات للرقم ${searchTerm} في العمودين B و C.</p>`;
                            }
                        }
                    });

                    if (found) {
                        resultContainer.innerHTML = resultsHTML;
                    } else {
                        resultContainer.innerHTML = '<p class="not-found">لم يتم العثور على الرقم في الجدول لهذه السنة.</p>';
                    }
                })
                .catch(error => {
                    loader.style.display = 'none';
                    console.error('حدث خطأ أثناء جلب البيانات أو البحث:', error);
                    resultContainer.innerHTML = '<p class="not-found">حدث خطأ أثناء جلب البيانات. الرجاء التأكد من اتصالك بالإنترنت أو صحة رابط الجدول.</p>';
                });
        });
    } else {
        console.error("عناصر البحث (الزر 'searchButton'، الإدخال 'searchInput'، الحاوية 'resultContainer'، أو اللودر 'loader') غير موجودة في HTML. تأكد من صحة معرفات العناصر.");
    }
});
