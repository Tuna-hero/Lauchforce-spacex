// v5
const API_URL = 'https://api.spacexdata.com/v5/launches';

// SON FIRLATMALARI - GELECEK GÖREVLERİ ÇEKME
async function loadLaunches(type) {
    const container = document.getElementById('launches-container');
    const title = document.getElementById('section-title');
    

    if (!container) return;


    container.innerHTML = '<div class="col-12 text-center text-white"><div class="spinner-border text-primary"></div><p class="mt-2">Veriler Yükleniyor...</p></div>';


    const btnLatest = document.getElementById('btn-latest');
    const btnUpcoming = document.getElementById('btn-upcoming');

    if (type === 'latest') {
        if(btnLatest) btnLatest.className = 'btn btn-primary px-4';
        if(btnUpcoming) btnUpcoming.className = 'btn btn-outline-secondary px-4 text-white';
        if(title) title.innerText = 'SON FIRLATMALAR';
    } else {
        if(btnLatest) btnLatest.className = 'btn btn-outline-secondary px-4 text-white';
        if(btnUpcoming) btnUpcoming.className = 'btn btn-primary px-4';
        if(title) title.innerText = 'GELECEK FIRLATMALAR';
    }

    try {
        // v5 Endpointleri
        let url = type === 'latest' 
            ? 'https://api.spacexdata.com/v5/launches/past' 
            : 'https://api.spacexdata.com/v5/launches/upcoming';

        const response = await fetch(url);
        const data = await response.json();

        let launches = [];

        if (type === 'latest') {
            launches = data.reverse().slice(0, 3);
        } else {
            launches = data.slice(0, 3);
        }

        if (launches.length === 0) {
            container.innerHTML = '<div class="col-12 text-white-50 text-center">Gösterilecek veri yok.</div>';
            return;
        }

        container.innerHTML = '';


        const placeholderImg = 'img/hazirlik.jpg'; 

        launches.forEach(launch => {
            let finalImage = null;


            if (launch.links && launch.links.patch && launch.links.patch.small) {
                finalImage = launch.links.patch.small;
            } 

            else if (launch.links && launch.links.flickr && launch.links.flickr.original && launch.links.flickr.original.length > 0) {
                finalImage = launch.links.flickr.original[0];
            } 

            else {
                finalImage = placeholderImg;
            }

            // Tarih ayarlama
            let dateStr = "Tarih Belirsiz";
            if (launch.date_utc) {
                dateStr = new Date(launch.date_utc).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
            }

            container.innerHTML += `
                <div class="col-lg-4 col-md-6">
                    <div class="custom-stat-card h-100 p-4 d-flex flex-column text-center transition-card">
                        
                        <div class="badge bg-transparent border border-secondary text-white-50 mb-3 align-self-center">
                            ${launch.flight_number ? 'UÇUŞ #' + launch.flight_number : 'PLANLANIYOR'}
                        </div>

                        <div class="mb-4 d-flex justify-content-center align-items-center" style="height: 200px; overflow: hidden;">
                            <img src="${finalImage}" 
                                 onerror="this.src='https://images.unsplash.com/photo-1517976487492-5750f3195933?w=500&q=80'"
                                 class="img-fluid rounded" 
                                 style="max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));"
                                 alt="${launch.name}">
                        </div>

                        <h4 class="text-white fw-bold mb-2 text-uppercase">${launch.name}</h4>
                        
                        <p class="text-secondary small mb-4">
                            <i class="bi bi-calendar-event me-1"></i> ${dateStr}
                        </p>

                        <div class="mt-auto">
                            <a href="detail.html?id=${launch.id}" class="btn btn-outline-light w-100 rounded-pill py-2 hover-scale">
                                İncele
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Hata:", error);
        container.innerHTML = `<div class="col-12 alert alert-danger bg-transparent text-danger border-danger">Veri yüklenemedi.</div>`;
    }
}


// DETAY SAYFASI
async function loadMissionDetail(id) {
    const container = document.getElementById('detail-container');
    if(!container) return;

    // v5 endpoint'i
    const url = `https://api.spacexdata.com/v5/launches/${id}`;

    try {
        const response = await fetch(url);
        if(!response.ok) throw new Error('API Hatası');
        const mission = await response.json();


        let patchImage = mission.links.patch.large || mission.links.patch.small || 'img/hazirlik.jpg';
        

        let description = mission.details;
        const dateStr = new Date(mission.date_utc).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        
        if (!description) {
            const statusText = mission.success ? "başarıyla tamamlanmıştır" : "ne yazık ki başarısızlıkla sonuçlanmıştır";
            description = `SpaceX tarafından gerçekleştirilen <strong>${mission.name}</strong> görevi, ${dateStr} tarihinde fırlatılmıştır. Bu operasyon ${statusText}. SpaceX veri tabanında bu görev için özel bir basın açıklaması bulunmamaktadır, ancak teknik veriler sistemimizde mevcuttur.`;
        }


        let statusBadge = mission.success 
            ? '<span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2">BAŞARILI GÖREV</span>' 
            : '<span class="badge bg-danger bg-opacity-25 text-danger border border-danger px-3 py-2">GÖREV BAŞARISIZ</span>';
        
        if (mission.upcoming) statusBadge = '<span class="badge bg-warning bg-opacity-25 text-warning border border-warning px-3 py-2">GELECEK GÖREV</span>';

        //YOUTUBE VİDEOSU
        let videoEmbed = '';
        if (mission.links.youtube_id) {
            videoEmbed = `
                <div class="ratio ratio-16x9 rounded-4 overflow-hidden border border-secondary border-opacity-25 mt-4 shadow-lg">
                    <iframe src="https://www.youtube.com/embed/${mission.links.youtube_id}?rel=0" title="YouTube video" allowfullscreen></iframe>
                </div>
            `;
        }


        container.innerHTML = `
            <div class="row g-5">
                
                <div class="col-lg-4">
                    <div class="p-4 rounded-4 text-center position-relative sticky-top" style="top: 120px; background: linear-gradient(135deg, #050505 0%, #111 100%); border: 1px solid #333;">
                        
                        <div class="mb-4 mx-auto p-4 rounded-circle" style="background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%);">
                            <img src="${patchImage}" class="img-fluid drop-shadow-glow" alt="${mission.name}" 
                                 style="max-height: 300px; filter: drop-shadow(0 0 30px rgba(255,255,255,0.1));">
                        </div>

                        <h2 class="text-white fw-bold mb-3 text-uppercase">${mission.name}</h2>
                        <div class="mb-4">${statusBadge}</div>

                        <div class="d-grid gap-2">
                            ${mission.links.wikipedia ? `<a href="${mission.links.wikipedia}" target="_blank" class="btn btn-outline-light rounded-pill"><i class="bi bi-book me-2"></i> Wikipedia</a>` : ''}
                            ${mission.links.article ? `<a href="${mission.links.article}" target="_blank" class="btn btn-outline-secondary rounded-pill"><i class="bi bi-newspaper me-2"></i> Haberi Oku</a>` : ''}
                        </div>
                    </div>
                </div>

                <div class="col-lg-8">
                    
                    <div class="mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                        <h5 class="text-primary text-uppercase mb-2" style="letter-spacing: 2px;">GÖREV DETAYLARI</h5>
                        <h1 class="display-5 fw-bold text-white mb-0">Uçuş #${mission.flight_number}</h1>
                        <p class="text-secondary mt-2"><i class="bi bi-calendar-event me-2"></i> ${dateStr}</p>
                    </div>

                    <div class="p-4 rounded-4 mb-4" style="background: #111; border-left: 4px solid #0d6efd;">
                        <h5 class="text-white mb-3"> Görev Analizi</h5>
                        <p class="text-white-50 mb-0" style="line-height: 1.8; font-size: 1.05rem;">
                            ${description}
                        </p>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-md-4">
                            <div class="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 text-center h-100">
                                <small class="text-secondary text-uppercase d-block mb-1">ROKET TİPİ</small>
                                <span class="text-white fw-bold fs-5">${mission.rocket_name || 'Falcon 9'}</span> 
                                </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 text-center h-100">
                                <small class="text-secondary text-uppercase d-block mb-1">FIRLATMA ÜSSÜ</small>
                                <span class="text-white fw-bold fs-5 text-truncate d-block">${mission.launchpad ? 'Keneddy SC / CCAFS' : 'Bilinmiyor'}</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 text-center h-100">
                                <small class="text-secondary text-uppercase d-block mb-1">YÜK DURUMU</small>
                                <span class="text-white fw-bold fs-5">${mission.payloads.length} Adet</span>
                            </div>
                        </div>
                    </div>

                    ${videoEmbed ? `
                        <div class="mb-4">
                             <h5 class="text-white mb-3"><i class="bi bi-youtube me-2 text-danger"></i>Görev Kaydı</h5>
                             ${videoEmbed}
                        </div>
                    ` : ''}

                </div>
            </div>
        `;

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-danger bg-transparent text-danger border-danger">Detay bilgisi çekilemedi.</div>`;
    }
}



// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js');
    });
}


if(document.getElementById('showcase-container')) {
    loadLaunches('latest');
}
async function loadRoadster() {
    const container = document.getElementById('roadster-info');
    if(!container) return; 

    try {
        const response = await fetch('https://api.spacexdata.com/v4/roadster');
        const data = await response.json();

        // Sayıları formatla
        const earthDist = Math.round(data.earth_distance_km).toLocaleString('tr-TR');
        const speed = Math.round(data.speed_kph).toLocaleString('tr-TR');
        const marsDist = Math.round(data.mars_distance_km).toLocaleString('tr-TR');

        container.innerHTML = `
            <div class="col-lg-4 col-md-6">
                <div class="p-4 rounded-4 h-100 d-flex flex-column justify-content-center align-items-center" 
                     style="border: 2px solid white; min-height: 180px;">
                    <span class="text-white mb-3 text-uppercase small" style="letter-spacing: 1px;">Dünyadan Uzaklık</span>
                    
                    <div style="width: 50px; height: 3px; background-color: #fff; margin-bottom: 20px;"></div>
                    
                    <h3 class="text-white fw-bold m-0 display-6">${earthDist} km</h3>
                </div>
            </div>

            <div class="col-lg-4 col-md-6">
                <div class="p-4 rounded-4 h-100 d-flex flex-column justify-content-center align-items-center" 
                     style="border: 2px solid white; min-height: 180px;">
                    <span class="text-white mb-3 text-uppercase small" style="letter-spacing: 1px;">Mars'a Uzaklık</span>
                    
                    <div style="width: 50px; height: 3px; background-color: #ff7700; margin-bottom: 20px;"></div>
                    
                    <h3 class="fw-bold m-0 display-6" style="color: #ff7700;">${marsDist} km</h3>
                </div>
            </div>

            <div class="col-lg-4 col-md-6">
                <div class="p-4 rounded-4 h-100 d-flex flex-column justify-content-center align-items-center" 
                     style="border: 2px solid white; min-height: 180px;">
                    <span class="text-white mb-3 text-uppercase small" style="letter-spacing: 1px;">Hız (Saatte)</span>
                    
                    <div style="width: 50px; height: 3px; background-color: #fff; margin-bottom: 20px;"></div>
                    
                    <h3 class="text-white fw-bold m-0 display-6">${speed} km/s</h3>
                </div>
            </div>

            <div class="col-12 mt-5 text-center">
                <p class="small text-white-50 fst-italic mx-auto" style="max-width: 800px; line-height: 1.6;">"${data.details}"</p>
                <a href="${data.wikipedia}" target="_blank" class="btn btn-outline-light rounded-pill px-5 py-2 mt-3 hover-scale">
                    Hikayesini Oku
                </a>
            </div>
        `;
    } catch (error) {
        console.error("Starman hatası:", error);
        container.innerHTML = '<p class="text-white">Veri alınamadı.</p>';
    }
}
// Ana sayfa açılınca çalıştır
if(document.getElementById('roadster-info')) {
    loadRoadster();
}


//Geri Sayım
async function initCountdown() {
    const container = document.getElementById('countdown');
    if (!container) return;

    try {
        // API v5 kullanarak veriyi çekiyoruz
        const response = await fetch('https://api.spacexdata.com/v5/launches/next');
        const data = await response.json();
        

        const nameElement = document.getElementById('next-mission-name');
        if (nameElement) {
            nameElement.innerText = `GÖREV: ${data.name}`;
        }

        const launchDate = new Date(data.date_utc).getTime();

        // Her saniye güncellenen sayaç
        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                container.innerHTML = '<h3 class="text-success fw-bold">FIRLATMA GERÇEKLEŞTİ!</h3>';
                return;
            }

            // Matematiksel Hesaplamalar
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);


            document.getElementById('days').innerText = d < 10 ? '0' + d : d;
            document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
            document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
            document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;

        }, 1000);

    } catch (error) {
        console.error("API Hatası:", error);
        container.innerHTML = '<p class="text-danger">Sayaç verisi alınamadı.</p>';
    }
}



// MÜRETTEBAT
async function loadCrew() {
    const container = document.getElementById('crew-container');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/crew');
        const data = await response.json();
        const crewList = data.slice(0, 8); 

        container.innerHTML = ''; 

        for (const person of crewList) {
            // Resim bulma mantığı (Wiki veya API)
            let finalImage = person.image || 'img/hazirlik.jpg';
            try {
                if (person.wikipedia) {
                    const wikiImg = await getWikiImage(person.wikipedia);
                    if(wikiImg) finalImage = wikiImg;
                }
            } catch(e) {}

            container.innerHTML += `
                <div class="col-lg-3 col-md-4 col-6">
                    <div class="h-100 p-3 text-center rounded-4 transition-card" 
                         style="background: #111; border: 1px solid #333;">
                        <div class="mb-3 mx-auto" style="width: 100px; height: 100px; overflow: hidden; border-radius: 50%; border: 3px solid #0d6efd;">
                            <img src="${finalImage}" class="w-100 h-100 object-fit-cover" alt="${person.name}" onerror="this.src='img/hazirlik.jpg'">
                        </div>
                        <h6 class="text-white mb-1 fw-bold">${person.name}</h6>
                        <small class="text-secondary d-block text-uppercase mb-3" style="font-size: 0.75rem; letter-spacing: 1px;">${person.agency}</small>
                        <a href="${person.wikipedia}" target="_blank" class="btn btn-outline-secondary btn-sm rounded-pill w-100" style="font-size: 0.7rem;">Wikipedia</a>
                    </div>
                </div>
            `;
        }
    } catch (error) { container.innerHTML = ''; }
}

// DENİZ FİLOSU LİSTESİ
async function loadShips() {
    const container = document.getElementById('ships-container');
    

    if (!container) return;

    try {
        // Spinner
        container.innerHTML = '<div class="col-12 text-center text-white py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Filo Listeleniyor...</p></div>';

        const response = await fetch('https://api.spacexdata.com/v4/ships');
        const data = await response.json();
        
        container.innerHTML = ''; 
        

        const localShipImage = 'img/gemi.jpg'; 

        // Sadece aktif gemileri al
        const activeShips = data.filter(ship => ship.active);

        if (activeShips.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-white text-center">Aktif gemi bulunamadı.</p></div>';
            return;
        }


        activeShips.slice(0, 4).forEach(ship => {
            
            container.innerHTML += `
                <div class="col-md-6 mb-4">
                    <div class="custom-card d-flex align-items-center p-3 h-100 position-relative group-hover" style="background: #151515;">
                        
                        <img src="${localShipImage}" 
                             class="rounded me-3 shadow-sm" 
                             style="width:100px; height:100px; object-fit:cover; border: 2px solid #333;"
                             alt="${ship.name}"
                             onerror="this.src='img/hazirlik.jpg'">
                             
                        <div class="flex-grow-1">
                            <h5 class="text-white mb-1">${ship.name}</h5>
                            <p class="mb-0 bi-search small">Tip: ${ship.type}</p>
                            <p class="mb-2 bi-search small">Liman: ${ship.home_port}</p>
                            
                            <a href="ship-detail.html?id=${ship.id}" class="btn btn-sm btn-outline-primary stretched-link w-100">
                                <i class="bi bi-search"></i> İncele
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Gemi hatası:", error);
        container.innerHTML = '<div class="col-12 text-center alert alert-danger">Gemi verileri yüklenemedi.</div>';
    }
}
// 4. FIRLATMA RAMPALARINI ÇEKME
// FIRLATMA RAMPALARI 
async function loadLaunchpads() {
    const container = document.getElementById('launchpads-container');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/launchpads');
        const data = await response.json();
        
        container.innerHTML = '';
        data.forEach(pad => {
            const statusBadge = pad.status === 'active' 
                ? '<span class="badge bg-success bg-opacity-25 text-success border border-success">AKTİF</span>' 
                : '<span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary">EMEKLİ</span>';
            

            const details = pad.details ? pad.details.substring(0, 110) + '...' : 'Detay bilgisi bulunmuyor.';

            container.innerHTML += `
                <div class="col-lg-4 col-md-6">
                    <div class="h-100 p-4 d-flex flex-column transition-card position-relative" 
                         style="background: linear-gradient(135deg, #000 0%, #151515 100%); border: 1px solid #333; border-radius: 20px;">
                        
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="text-white fw-bold mb-0">${pad.name}</h5>
                            ${statusBadge}
                        </div>

                        <p class="text-primary small mb-3 text-uppercase"><i class="bi bi-geo-alt-fill me-1"></i> ${pad.region}</p>
                        <p class="text-secondary small mb-4" style="line-height: 1.6;">${details}</p>
                        
                        <div class="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between text-white-50 small">
                            <span> ${pad.launch_attempts} Kalkış</span>
                            <span> ${pad.launch_successes} Başarı</span>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<p class="text-white text-center">Veri alınamadı.</p>';
    }
}

// SAYFA YÜKLENDİĞİNDE HANGİSİ VARSA ONU ÇALIŞTIR

// WIKIPEDIA FOTOĞRAF ÇEKİCİ silme lan bunu mür de kulanacam
async function getWikiImage(wikiUrl) {
    if (!wikiUrl) return null;
    try {
        const title = wikiUrl.split('/').pop();
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pages[pageId].thumbnail) return pages[pageId].thumbnail.source;
        return null;
    } catch (error) { return null; }
}

// 1. STARLINK SAYISINI ÇEKME
async function loadStarlinkStats() {
    const container = document.getElementById('starlink-count');
    if (!container) return;

    try {
        // API v4 direkt count vermiyor, tüm listeyi çekip sayacağız (hafif bekletebilir ama sorun değil)
        // Alternatif olarak query endpoint kullanılabilir ama basit fetch iş görür.
        const response = await fetch('https://api.spacexdata.com/v4/starlink');
        const data = await response.json();
        

        container.innerText = data.length.toLocaleString('tr-TR');
        
    } catch (error) {
        container.innerText = "5000+"; 
    }
}

// EN ÇOK UÇAN ROKETLER (LİSTE GÜNCELLEMESİ)
async function loadTopCores() {
    const container = document.getElementById('top-cores');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/cores');
        const data = await response.json();
        const topCores = data.sort((a, b) => b.reuse_count - a.reuse_count).slice(0, 5); 

        container.innerHTML = '';
        
        topCores.forEach((core, index) => {
            let icon = `<span class="badge bg-secondary rounded-circle">${index+1}</span>`;
            if (index === 0) icon = '#1';
            if (index === 1) icon = '#2';
            if (index === 2) icon = '#3';

            container.innerHTML += `
                <li class="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center border-secondary border-opacity-25 py-3">
                    <div class="d-flex align-items-center">
                        <span class="fs-5 me-3">${icon}</span>
                        <span class="fw-bold text-white-50">${core.serial}</span>
                    </div>
                    <span class="badge bg-dark border border-secondary text-white p-2 rounded-pill">
                        ${core.reuse_count} UÇUŞ
                    </span>
                </li>
            `;
        });
    } catch (error) { container.innerHTML = ''; }
}
// Sayfa yüklendiğinde bunları da çalıştır
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('starlink-count')) loadStarlinkStats();
    if(document.getElementById('top-cores')) loadTopCores();
    if(document.getElementById('countdown')) {
        initCountdown(); 
    }
});

// DRAGON KAPSÜLLERİ
async function loadDragons() {
    const container = document.getElementById('dragons-container');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/dragons');
        const data = await response.json();
        
        container.innerHTML = '';
        const backupImage = 'https://images.unsplash.com/photo-1541873676-a18131494184?w=500&q=80';

        data.forEach(dragon => {
            const statusBadge = dragon.active 
                ? '<span class="badge bg-success bg-opacity-25 text-success border border-success">AKTİF</span>' 
                : '<span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary">EMEKLİ</span>';
            
            const imgUrl = (dragon.flickr_images.length > 0) ? dragon.flickr_images[0] : backupImage;

            container.innerHTML += `
                <div class="col-md-6">
                    <div class="h-100 rounded-4 overflow-hidden border border-secondary border-opacity-25" style="background: #111;">
                        <div style="height: 200px; overflow: hidden;">
                            <img src="${imgUrl}" class="w-100 h-100 object-fit-cover" alt="${dragon.name}" onerror="this.src='${backupImage}'">
                        </div>
                        <div class="p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-white mb-0 fw-bold">${dragon.name}</h4>
                                ${statusBadge}
                            </div>
                            <p class="text-secondary small mb-4">${dragon.description}</p>
                            
                            <div class="d-flex justify-content-between text-center border-top border-secondary border-opacity-25 pt-3">
                                <div>
                                    <span class="d-block text-white fw-bold">${dragon.crew_capacity}</span>
                                    <small class="text-secondary" style="font-size: 10px;">KİŞİ</small>
                                </div>
                                <div>
                                    <span class="d-block text-white fw-bold">${dragon.dry_mass_kg} kg</span>
                                    <small class="text-secondary" style="font-size: 10px;">AĞIRLIK</small>
                                </div>
                                <div>
                                    <span class="d-block text-white fw-bold">${dragon.first_flight}</span>
                                    <small class="text-secondary" style="font-size: 10px;">İLK UÇUŞ</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) { container.innerHTML = ''; }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('dragons-container')) loadDragons();
});

// İNİŞ SAHALARINI ÇEKME

async function loadLandpads() {
    const container = document.getElementById('landpads-container');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/landpads');
        const data = await response.json();
        
        container.innerHTML = '';

        data.forEach(pad => {
            const statusBadge = pad.status === 'active' 
                ? '<span class="badge bg-success bg-opacity-25 text-success border border-success">AKTİF</span>' 
                : '<span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary">EMEKLİ</span>';
            
            // Başarı Oranı
            const successRate = pad.landing_attempts > 0 
                ? Math.round((pad.landing_successes / pad.landing_attempts) * 100) 
                : 0;

            container.innerHTML += `
                <div class="col-lg-6 mb-4">
                    <div class="h-100 p-4 d-flex flex-column transition-card" 
                         style="background: linear-gradient(135deg, #000 0%, #151515 100%); border: 1px solid #333; border-radius: 20px;">
                        
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h4 class="text-white fw-bold mb-1">${pad.name}</h4>
                                <small class="text-white-50">${pad.full_name}</small>
                            </div>
                            ${statusBadge}
                        </div>
                        
                        <div class="row g-2 mb-4">
                            <div class="col-4">
                                <div class="p-2 text-center rounded bg-dark border border-secondary border-opacity-25">
                                    <span class="d-block text-white fw-bold">${pad.landing_attempts}</span>
                                    <small class="text-secondary" style="font-size: 10px;">DENEME</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="p-2 text-center rounded bg-dark border border-secondary border-opacity-25">
                                    <span class="d-block text-success fw-bold">${pad.landing_successes}</span>
                                    <small class="text-secondary" style="font-size: 10px;">BAŞARI</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="p-2 text-center rounded bg-dark border border-secondary border-opacity-25">
                                    <span class="d-block text-info fw-bold">%${successRate}</span>
                                    <small class="text-secondary" style="font-size: 10px;">ORAN</small>
                                </div>
                            </div>
                        </div>

                        <p class="text-white-50 small mb-4"><i class="bi bi-geo-alt me-1"></i> ${pad.locality}, ${pad.region}</p>

                        <a href="landpad-detail.html?id=${pad.id}" class="btn btn-outline-light w-100 rounded-pill py-2 mt-auto hover-scale">
                            Detayları İncele
                        </a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<p class="text-white text-center">Veri alınamadı.</p>';
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('landpads-container')) loadLandpads();
});

// EN AĞIR YÜKLER TABLOSU 
async function loadHeavyPayloads() {
    const container = document.getElementById('heavy-payloads');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/payloads');
        const data = await response.json();
        

        let sortedData = data
            .filter(p => p.mass_kg !== null)
            .sort((a, b) => b.mass_kg - a.mass_kg);


        const uniquePayloads = [];
        let starlinkAdded = false; 

        for (const p of sortedData) {
 
            if (uniquePayloads.length >= 5) break;

      
            if (p.name.includes('Starlink')) {
                if (starlinkAdded) continue; 
                starlinkAdded = true;
            }

            // Listeye ekle
            uniquePayloads.push(p);
        }

        container.innerHTML = '';

        uniquePayloads.forEach((payload, index) => {
            let rankStyle = 'text-white';
            let icon = `#${index + 1}`;
            
            if (index === 0) { icon = '#1'; rankStyle = 'text-warning fs-5'; }
            if (index === 1) { icon = '#2'; rankStyle = 'text-white-50 fs-5'; }
            if (index === 2) { icon = '#3'; rankStyle = 'text-white-50 fs-5'; }

            container.innerHTML += `
                <tr style="border-bottom: 1px solid #333;">
                    <td class="py-4 ${rankStyle}">${icon}</td>
                    <td class="py-4 fw-bold text-white text-uppercase">${payload.name}</td>
                    <td class="py-4"><span class="badge bg-dark border border-secondary text-secondary">${payload.type}</span></td>
                    <td class="py-4 text-info fw-bold" style="letter-spacing:1px;">${payload.mass_kg.toLocaleString()} kg</td>
                    <td class="py-4 text-secondary small">${payload.orbit || 'Bilinmiyor'}</td>
                </tr>
            `;
        });

    } catch (error) {
        container.innerHTML = '<tr><td colspan="5" class="text-danger py-3">Veri alınamadı.</td></tr>';
    }
}
// 2. GENEL BAŞARI ORANI HESAPLAMA
async function calculateSuccessRate() {
    const bar = document.getElementById('success-bar');
    const text = document.getElementById('success-text');
    if (!bar) return;

    try {
        // Sadece geçmiş fırlatmaları al
        const response = await fetch('https://api.spacexdata.com/v5/launches/past');
        const data = await response.json();

        const totalLaunches = data.length;
        // Başarılı olanları say
        const successfulLaunches = data.filter(launch => launch.success).length;
        
        // Yüzdeyi hesapla
        const percentage = ((successfulLaunches / totalLaunches) * 100).toFixed(1);

        // Barı güncelle
        bar.style.width = `${percentage}%`;
        bar.innerText = `%${percentage}`;
        
        // Metni güncelle
        text.innerHTML = `Toplam <strong>${totalLaunches}</strong> görevden <strong>${successfulLaunches}</strong> tanesi başarıyla tamamlandı.`;

    } catch (error) {
        bar.innerText = "Hata";
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('heavy-payloads')) loadHeavyPayloads();
    if(document.getElementById('success-bar')) calculateSuccessRate();
});
//FIRLATMA GRAFİĞİ
async function loadLaunchChart() {
    const ctx = document.getElementById('launchChart');
    if (!ctx) return; 

    try {
        const response = await fetch('https://api.spacexdata.com/v5/launches/past');
        const data = await response.json();

        const yearCounts = {};
        
        data.forEach(launch => {
            const year = new Date(launch.date_utc).getFullYear();
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        });

        const years = Object.keys(yearCounts);
        const counts = Object.values(yearCounts);

        if (window.myLaunchChart) window.myLaunchChart.destroy();

        window.myLaunchChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Görev Sayısı',
                    data: counts,
                    
    
                    backgroundColor: '#ffffff', 
                    hoverBackgroundColor: '#0d6efd', 
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false } 
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#333' }, 
                        ticks: { color: '#aaa' } 
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#aaa' }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Grafik oluşturulamadı", error);
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('launchChart')) loadLaunchChart();
});

// KAPSÜL ENVANTERİ 
async function loadCapsules() {
    const container = document.getElementById('capsules-container');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/capsules');
        const data = await response.json();
        const topCapsules = data.sort((a, b) => b.reuse_count - a.reuse_count).slice(0, 8); 

        container.innerHTML = '';

        topCapsules.forEach(cap => {
            let statusClass = cap.status === 'active' ? 'text-success border-success' : 'text-secondary border-secondary';
            let statusText = cap.status === 'active' ? 'AKTİF' : 'EMEKLİ';

            container.innerHTML += `
                <div class="col-lg-3 col-md-4 col-sm-6">
                    <div class="h-100 p-4 text-center transition-card position-relative d-flex flex-column" 
                         style="background: linear-gradient(135deg, #000 0%, #151515 100%); 
                                border: 1px solid #333; border-radius: 20px;">
                        
                        <div class="mb-3">
                             <span class="badge bg-transparent border ${statusClass} small">${statusText}</span>
                        </div>

                        <h4 class="text-white fw-bold mb-1">${cap.serial}</h4>
                        <p class="text-primary small mb-3 text-uppercase">${cap.type}</p>
                        
                        <div class="py-2 mb-3 rounded border border-secondary bg-dark">
                            <h5 class="m-0 text-white">${cap.reuse_count}</h5>
                            <small class="text-white-50" style="font-size: 10px;">TEKRAR KULLANIM</small>
                        </div>

                        <a href="capsule-detail.html?id=${cap.id}" class="btn btn-outline-light btn-sm w-100 mt-auto rounded-pill hover-scale">
                            İncele
                        </a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<p class="text-white-50 text-center">Kapsül verisi yok.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('capsules-container')) loadCapsules();
});

//YÖRÜNGE GRAFİĞİ 
async function loadOrbitChart() {
    const ctx = document.getElementById('orbitChart');
    if (!ctx) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/payloads');
        const data = await response.json();

        const orbitCounts = {};
        
        data.forEach(payload => {
            const orbit = payload.orbit || 'Diğer';
            // Popüler yörüngeleri al
            if (['ISS', 'LEO', 'GTO', 'PO', 'ES-L1'].includes(orbit)) {
                orbitCounts[orbit] = (orbitCounts[orbit] || 0) + 1;
            } else {
                orbitCounts['Diğer'] = (orbitCounts['Diğer'] || 0) + 1;
            }
        });

        // Varsa eski grafiği temizle
        if (window.myOrbitChart) window.myOrbitChart.destroy();

        window.myOrbitChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(orbitCounts),
                datasets: [{
                    data: Object.values(orbitCounts),
                    
     
                    backgroundColor: [
                        '#ffffff', 
                        '#b3b3b3', 
                        '#666666',
                        '#0d6efd', 
                        '#ff7700', 
                        '#333333'  
                    ],
                    borderColor: '#000000', 
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'right', 
                        labels: { color: '#fff', boxWidth: 10, usePointStyle: true } 
                    }
                },
                cutout: '70%' 
            }
        });

    } catch (error) {
        console.error("Orbit grafik hatası", error);
    }
}

//TOPLAM MALİYET 
async function calculateTotalCost() {
    const container = document.getElementById('total-cost');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v5/launches/past');
        const data = await response.json();

        let totalMillions = 0;

        data.forEach(launch => {
            if (launch.rocket === '5e9d0d95eda69973a809d1ec') { 
                totalMillions += 67; 
            } else if (launch.rocket === '5e9d0d95eda69974db09d1ed') {
                totalMillions += 97; 
            } else {
                totalMillions += 60; 
            }
        });

        const billions = totalMillions / 1000;
        let current = 0;
        const step = billions / 50; 
        
        const timer = setInterval(() => {
            current += step;
            if (current >= billions) {
                current = billions;
                clearInterval(timer);
            }
            container.innerText = `$${Number(current).toFixed(2)} Mr`;
        }, 30);

    } catch (error) {
        console.error("Para sayacı hatası:", error);
        container.innerText = "$--";
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('crew-container')) {
        loadCrew();
    }
    if(document.getElementById('orbitChart')) loadOrbitChart();
    if(document.getElementById('total-cost')) calculateTotalCost();

});

// STARLINK VERSİYONLARINI ANALİZ ETME
async function loadStarlinkVersions() {
    const container = document.getElementById('starlink-versions');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/starlink');
        const data = await response.json();

        // Versiyonları sayma algoritması
        const versionCounts = {};
        
        data.forEach(sat => {

            const ver = sat.version ? sat.version : 'Bilinmiyor';
            
            if (versionCounts[ver]) {
                versionCounts[ver]++;
            } else {
                versionCounts[ver] = 1;
            }
        });


        container.innerHTML = '';

        // Object'i diziye çevirip sırala (Çoktan aza doğru)
        const sortedVersions = Object.entries(versionCounts)
            .sort((a, b) => b[1] - a[1]); // Sayısı çok olan en üste


        sortedVersions.forEach(([version, count]) => {
            // Toplamın yüzdesini hesapla (Bar çubuğu için)
            const percentage = ((count / data.length) * 100).toFixed(1);

            container.innerHTML += `
                <div class="mb-3">
                    <div class="d-flex justify-content-between text-white mb-1">
                        <span class="fw-bold text-primary">${version}</span>
                        <span class="small">${count} Uydu (%${percentage})</span>
                    </div>
                    <div class="progress" style="height: 10px; background-color: #333;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        container.innerHTML = '<p class="text-white">Veri analiz edilemedi.</p>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('starlink-versions')) loadStarlinkVersions();
});

//BAŞARI SERİSİ HESAPLAMA
async function calculateStreak() {
    const container = document.getElementById('success-streak');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v5/launches/past');
        const data = await response.json();
        const reversedData = data.reverse();
        
        let streak = 0;
        for (let mission of reversedData) {
            if (mission.success) {
                streak++;
            } else {
                break;
            }
        }
        container.innerText = `${streak}`; 

    } catch (error) {
        container.innerText = "0";
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('success-streak')) calculateStreak();

});

// ROKET KARŞILAŞTIRMASI
async function loadRocketComparison() {
    const container = document.getElementById('rocket-comparison');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/rockets');
        const data = await response.json();
        
        container.innerHTML = '';
        const maxHeight = 120; 

        data.forEach(rocket => {
            const heightPercent = (rocket.height.meters / maxHeight) * 100;
            
            container.innerHTML += `
                <div class="mb-5">
                    <div class="d-flex justify-content-between text-white mb-2 px-1">
                        <span class="fw-bold text-uppercase" style="letter-spacing:1px;">${rocket.name}</span>
                        <span class="text-secondary">${rocket.height.meters} metre</span>
                    </div>
                    <div class="progress" style="height: 30px; background-color: #000; border-radius: 10px; border: 1px solid #333;">
                        <div class="progress-bar" 
                             role="progressbar" 
                             style="width: ${heightPercent}%; 
                                    background: linear-gradient(90deg, #0d6efd 0%, #0dcaf0 100%); 
                                    font-weight: bold; text-shadow: 1px 1px 2px black;">
                             ${rocket.mass.kg.toLocaleString()} kg Ağırlık
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<p class="text-white-50 text-center">Roket verisi alınamadı.</p>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('rocket-comparison')) loadRocketComparison();
});

// BAŞARISIZLIKLAR TABLOSU
async function loadFailures() {
    const container = document.getElementById('failures-table');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v5/launches/past');
        const data = await response.json();
        const failures = data.filter(launch => launch.success === false);

        container.innerHTML = '';

        failures.forEach(fail => {
            let reason = fail.failures.length > 0 ? fail.failures[0].reason : (fail.details || "Bilinmiyor");

            container.innerHTML += `
                <tr style="border-bottom: 1px solid #444;">
                    <td class="fw-bold text-white py-3">${fail.name}</td>
                    <td class="text-white-50 small">${new Date(fail.date_utc).toLocaleDateString('tr-TR')}</td>
                    <td><span class="badge bg-secondary bg-opacity-25 border border-secondary text-secondary">#${fail.flight_number}</span></td>
                    <td class="text-danger small text-start">${reason.substring(0, 80)}...</td>
                </tr>
            `;
        });
    } catch (error) { container.innerHTML = ''; }
}


document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('failures-table')) loadFailures();
});

// RASTGELE FOTOĞRAF ÇEKİCİ
async function loadRandomPhoto() {
    const container = document.getElementById('random-photo-container');
    const caption = document.getElementById('photo-caption');
    if (!container) return;

    try {
        // Geçmiş görevleri çek
        const response = await fetch('https://api.spacexdata.com/v5/launches/past');
        const data = await response.json();

        // Tüm görevlerdeki Flickr fotoğraflarını tek bir havuzda topla
        let photoPool = [];
        data.forEach(launch => {
            if (launch.links.flickr.original.length > 0) {
                // Fotoğraf varsa, linki ve görev adını havuza at
                launch.links.flickr.original.forEach(photoUrl => {
                    photoPool.push({ url: photoUrl, missionName: launch.name });
                });
            }
        });

        // Havuzdan rastgele bir tane seç
        if (photoPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * photoPool.length);
            const randomPhoto = photoPool[randomIndex];

            // Resmi konteynera yerleştir (CSS ile arka plan olarak)
            container.innerHTML = ''; // Spinner'ı sil
            container.style.backgroundImage = `url('${randomPhoto.url}')`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center center';
            

            caption.innerText = `Görev: ${randomPhoto.missionName} (API Arşivinden)`;
        } else {
             container.innerHTML = '<p class="text-white">Fotoğraf bulunamadı.</p>';
        }

    } catch (error) {
        console.error('Fotoğraf hatası:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('random-photo-container')) loadRandomPhoto();

});

// TARİHÇE TIMELINE
async function loadHistoryTimeline() {
    const container = document.getElementById('history-timeline');
    if (!container) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/history');
        const data = await response.json();

        const sortedHistory = data.sort((a, b) => new Date(a.event_date_utc) - new Date(b.event_date_utc));

        container.innerHTML = ''; 

        sortedHistory.forEach(event => {
            const date = new Date(event.event_date_utc);
            const year = date.getFullYear();
            const month = date.toLocaleDateString('tr-TR', { month: 'long' });

            container.innerHTML += `
                <div class="mb-5 position-relative">
                    <div style="position: absolute; left: -39px; top: 0; width: 18px; height: 18px; 
                                background: #0d6efd; border: 4px solid #000; border-radius: 50%; box-shadow: 0 0 10px #0d6efd;"></div>
                    
                    <div class="p-4 rounded-4 transition-card" 
                         style="background: linear-gradient(135deg, #111 0%, #1a1a1a 100%); border: 1px solid #333;">
                        <span class="badge bg-primary bg-opacity-10 text-primary mb-2 border border-primary border-opacity-25">${month} ${year}</span>
                        <h4 class="text-white mb-2 fw-bold">${event.title}</h4>
                        <p class="text-secondary mb-3 small" style="line-height: 1.6;">${event.details}</p>
                        
                        ${event.links.article ? `<a href="${event.links.article}" target="_blank" class="btn btn-sm btn-outline-light rounded-pill px-3">Haberi Oku</a>` : ''}
                    </div>
                </div>
            `;
        });
    } catch (error) { container.innerHTML = '<p class="text-white">Tarihçe yüklenemedi.</p>'; }
}


document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('history-timeline')) loadHistoryTimeline();

});


document.addEventListener('DOMContentLoaded', () => {
    

    const launchesContainer = document.getElementById('launches-container');
    if (launchesContainer) {
        loadLaunches('latest'); 
    }


    if(document.getElementById('countdown')) initCountdown();

    if(document.getElementById('roadster-info')) loadRoadster();

    if(document.getElementById('launchChart')) loadLaunchChart();
    if(document.getElementById('orbitChart')) loadOrbitChart();
    if(document.getElementById('total-cost')) calculateTotalCost();
    if(document.getElementById('random-photo-container')) loadRandomPhoto();
    if(document.getElementById('success-streak')) calculateStreak();



    if(document.getElementById('history-timeline')) loadHistoryTimeline();
    if(document.getElementById('failures-table')) loadFailures();
    if(document.getElementById('starlink-versions')) loadStarlinkVersions();

    if(document.getElementById('products-container')) fetchAllMissions();
    if(document.getElementById('rocket-comparison')) loadRocketComparison();
    if(document.getElementById('dragons-container')) loadDragons();
    if(document.getElementById('ships-container')) loadShips();
    if(document.getElementById('launchpads-container')) loadLaunchpads();
    if(document.getElementById('landpads-container')) loadLandpads();

    if(document.getElementById('capsule-detail-container')) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if(id) loadCapsuleDetail(id);
    }
    

    if(document.getElementById('detail-container')) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if(id) loadMissionDetail(id);
    }
});

// KAPSÜL DETAY SAYFASI
async function loadCapsuleDetail(id) {
    const container = document.getElementById('capsule-detail-container');
    if(!container) return;

    try {
        const response = await fetch(`https://api.spacexdata.com/v4/capsules/${id}`);
        const cap = await response.json();

        // Kapsül resmi API'de yok, biz havalı bir Dragon resmi koyalım
        const capsuleImage = 'https://images.unsplash.com/photo-1517976487492-5750f3195933?ixlib=rb-4.0.3&w=800&q=80';

        // Durum rengi
        const statusBadge = cap.status === 'active' 
            ? '<span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2">FİLODA AKTİF</span>' 
            : '<span class="badge bg-danger bg-opacity-25 text-danger border border-danger px-3 py-2">EMEKLİ / YOK OLDU</span>';


        let missionsHtml = '';
        if(cap.launches.length > 0) {
            cap.launches.forEach(launchId => {
                missionsHtml += `<a href="detail.html?id=${launchId}" class="btn btn-outline-secondary btn-sm me-2 mb-2 rounded-pill px-3">Görev ${launchId.slice(0,4)}...</a>`;
            });
        } else {
            missionsHtml = '<span class="text-white-50 small fst-italic">Henüz bir görev kaydı bulunmuyor.</span>';
        }


        container.innerHTML = `
            <div class="col-lg-5">
                <div class="p-4 rounded-4 text-center position-relative h-100" 
                     style="background: linear-gradient(135deg, #050505 0%, #111 100%); border: 1px solid #333;">
                    
                    <div class="mb-4 mx-auto p-2 rounded-4" style="background: rgba(255,255,255,0.03); border: 1px solid #222;">
                        <img src="${capsuleImage}" class="img-fluid rounded-3 shadow-lg" 
                             alt="${cap.serial}" 
                             style="filter: drop-shadow(0 0 20px rgba(255,255,255,0.1));">
                    </div>

                    <h2 class="display-5 fw-bold text-white mb-1">${cap.serial}</h2>
                    <p class="text-primary fs-5 text-uppercase mb-4" style="letter-spacing: 2px;">${cap.type}</p>
                    
                    <div class="mb-3">${statusBadge}</div>
                </div>
            </div>

            <div class="col-lg-7">
                
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h3 class="fw-bold text-white mb-0">${cap.reuse_count}</h3>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Tekrar Kullanım</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h3 class="fw-bold text-info mb-0">${cap.water_landings}</h3>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Suya İniş</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h3 class="fw-bold text-success mb-0">${cap.land_landings}</h3>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Karaya İniş</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h5 class="fw-bold text-warning mb-0 mt-1">${cap.last_update ? 'Mevcut' : 'Yok'}</h5>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Durum Bilgisi</small>
                        </div>
                    </div>
                </div>

                <div class="p-4 rounded-4 mb-4" style="background: #111; border-left: 4px solid #ffc107;">
                    <h5 class="text-white mb-3"> Son Durum Raporu</h5>
                    <p class="text-white-50 mb-0 fst-italic" style="line-height: 1.6;">
                        "${cap.last_update ? cap.last_update : 'Bu kapsül için özel bir durum raporu bulunmamaktadır. Standart bakım prosedürleri uygulanmaktadır.'}"
                    </p>
                </div>

                <div class="p-4 rounded-4" style="background: #111; border: 1px solid #333;">
                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2 mb-3">
                        <h5 class="text-white mb-0"> Katıldığı Görevler</h5>
                        <span class="badge bg-dark border border-secondary text-white-50">${cap.launches.length} Adet</span>
                    </div>
                    <div>${missionsHtml}</div>
                </div>

            </div>
        `;

    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger bg-transparent text-danger border-danger">Kapsül verisi alınamadı.</div>`;
    }
}

// GEMİ DETAYI
async function loadShipDetail(id) {
    const container = document.getElementById('ship-detail-container');
    if(!container) return;

    try {
        const response = await fetch(`https://api.spacexdata.com/v4/ships/${id}`);
        const ship = await response.json();


        const localShipImage = 'img/gemifilosu.jpg'; 
        

        const statusBadge = ship.active 
            ? '<span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2">FİLODA AKTİF</span>' 
            : '<span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary px-3 py-2">EMEKLİ / PASİF</span>';


        let missionsHtml = '';
        if(ship.launches.length > 0) {
            ship.launches.forEach(launchId => {
                missionsHtml += `<a href="detail.html?id=${launchId}" class="btn btn-outline-secondary btn-sm me-2 mb-2 rounded-pill px-3">Görev ${launchId.slice(0,4)}...</a>`;
            });
        } else {
            missionsHtml = '<span class="text-white-50 small fst-italic">Kayıtlı görev geçmişi bulunmuyor.</span>';
        }


        container.innerHTML = `
            <div class="col-lg-5">
                <div class="p-4 rounded-4 text-center position-relative h-100" 
                     style="background: linear-gradient(135deg, #050505 0%, #111 100%); border: 1px solid #333;">
                    
                    <div class="mb-4 mx-auto p-2 rounded-4" style="background: rgba(255,255,255,0.03); border: 1px solid #222;">
                        <img src="${localShipImage}" class="img-fluid rounded-3 shadow-lg" 
                             alt="${ship.name}" 
                             onerror="this.src='img/hazirlik.jpg'"
                             style="filter: drop-shadow(0 0 20px rgba(255,255,255,0.1));">
                    </div>

                    <h2 class="display-5 fw-bold text-white mb-1">${ship.name}</h2>
                    <p class="text-primary fs-5 text-uppercase mb-4" style="letter-spacing: 2px;">${ship.type}</p>
                    
                    <div class="mb-4">${statusBadge}</div>

                    ${ship.link ? `<a href="${ship.link}" target="_blank" class="btn btn-primary w-100 rounded-pill py-2 fw-bold"><i class="bi bi-radar me-2"></i>MarineTraffic Takip</a>` : ''}
                </div>
            </div>

            <div class="col-lg-7">
                
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h5 class="fw-bold text-white mb-0 text-truncate">${ship.home_port}</h5>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Ana Liman</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h5 class="fw-bold text-info mb-0">${ship.year_built ? ship.year_built : 'N/A'}</h5>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Yapım Yılı</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h5 class="fw-bold text-white mb-0">${ship.mass_kg ? ship.mass_kg.toLocaleString() : 'N/A'} kg</h5>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Ağırlık</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h5 class="fw-bold text-warning mb-0 text-truncate">${ship.roles.length > 0 ? ship.roles[0] : 'Destek'}</h5>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Ana Görevi</small>
                        </div>
                    </div>
                </div>

                <div class="p-4 rounded-4 mb-4" style="background: #111; border-left: 4px solid #0dcaf0;">
                    <h5 class="text-white mb-3"> Görev Rolleri</h5>
                    <p class="text-white-50 mb-0 fs-6">
                        ${ship.roles.length > 0 ? ship.roles.join(', ') : 'Belirtilmemiş'}
                    </p>
                </div>

                <div class="p-4 rounded-4" style="background: #111; border: 1px solid #333;">
                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2 mb-3">
                        <h5 class="text-white mb-0"> Destek Verdiği Görevler</h5>
                        <span class="badge bg-dark border border-secondary text-white-50">${ship.launches.length} Adet</span>
                    </div>
                    <div>${missionsHtml}</div>
                </div>

            </div>
        `;

    } catch (error) {
        console.error("Hata:", error);
        container.innerHTML = '<div class="alert alert-danger bg-transparent text-danger border-danger">Gemi verisi yüklenemedi.</div>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
if (document.getElementById('mission-archive-section')) {
        loadMissionArchive();
    }

if(document.getElementById('landpad-detail-container')) {
        loadLandpadDetail();
    }

    if(document.getElementById('ships-container')) {
        loadShips(); 
    }


    if(document.getElementById('ship-detail-container')) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if(id) loadShipDetail(id); 
    }

});
// İNİŞ SAHASI DETAYI
async function loadLandpadDetail() {
    const container = document.getElementById('landpad-detail-container');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!container || !id) return;

    try {
        const response = await fetch(`https://api.spacexdata.com/v4/landpads/${id}`);
        const pad = await response.json();


        const successRate = pad.landing_attempts > 0 
            ? Math.round((pad.landing_successes / pad.landing_attempts) * 100) 
            : 0;


        const statusBadge = pad.status === 'active' 
            ? '<span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2">AKTİF SAHA</span>' 
            : '<span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary px-3 py-2">EMEKLİ / PASİF</span>';


        let landingsHtml = '';
        if(pad.launches.length > 0) {

            pad.launches.slice(0, 12).forEach(launchId => {
                landingsHtml += `<a href="detail.html?id=${launchId}" class="btn btn-outline-secondary btn-sm me-2 mb-2 rounded-pill px-3">Görev ${launchId.slice(0,4)}...</a>`;
            });
            if(pad.launches.length > 12) landingsHtml += `<span class="text-white-50 small ms-2 align-middle">ve ${pad.launches.length - 12} daha...</span>`;
        } else {
            landingsHtml = '<span class="text-white-50 small fst-italic">Henüz bir iniş kaydı bulunmuyor.</span>';
        }


        container.innerHTML = `
            <div class="col-lg-5">
                <div class="p-5 rounded-4 text-center position-relative h-100 d-flex flex-column justify-content-center" 
                     style="background: linear-gradient(135deg, #050505 0%, #111 100%); border: 1px solid #333;">
                    
                    <h2 class="display-5 fw-bold text-white mb-2">${pad.name}</h2>
                    <p class="text-primary fs-5 text-uppercase mb-5" style="letter-spacing: 2px;">${pad.type}</p>
                    
                    <div class="mb-5">${statusBadge}</div>

                    <div class="d-grid gap-3">
                        <a href="https://www.google.com/maps?q=${pad.latitude},${pad.longitude}" target="_blank" class="btn btn-primary rounded-pill py-3 fw-bold shadow-lg">
                            <i class="bi bi-geo-alt-fill me-2"></i> Haritada Göster
                        </a>
                        ${pad.wikipedia ? `<a href="${pad.wikipedia}" target="_blank" class="btn btn-outline-light rounded-pill py-2"><i class="bi bi-book me-2"></i> Wikipedia</a>` : ''}
                    </div>
                </div>
            </div>

            <div class="col-lg-7">
                
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h3 class="fw-bold text-white mb-0">${pad.landing_attempts}</h3>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Toplam Deneme</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h3 class="fw-bold text-success mb-0">${pad.landing_successes}</h3>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Başarılı İniş</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 rounded-4 bg-dark border border-secondary border-opacity-25 text-center">
                            <h3 class="fw-bold text-info mb-0">%${successRate}</h3>
                            <small class="text-white-50 text-uppercase" style="font-size: 0.75rem;">Başarı Oranı</small>
                        </div>
                    </div>
                </div>

                <div class="p-4 rounded-4 mb-4" style="background: #111; border-left: 4px solid #0dcaf0;">
                    <h5 class="text-white mb-3"> Konum ve Detaylar</h5>
                    <p class="text-white-50 mb-3" style="line-height: 1.6;">
                        ${pad.details}
                    </p>
                    <div class="text-white small">
                        <strong>Tam Konum:</strong> ${pad.locality}, ${pad.region}
                    </div>
                </div>

                <div class="p-4 rounded-4" style="background: #111; border: 1px solid #333;">
                    <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2 mb-3">
                        <h5 class="text-white mb-0"> Buraya İnen Son Roketler</h5>
                        <span class="badge bg-dark border border-secondary text-white-50">${pad.launches.length} Adet</span>
                    </div>
                    <div>${landingsHtml}</div>
                </div>

            </div>
        `;

    } catch (error) {
        console.error("Hata:", error);
        container.innerHTML = '<div class="alert alert-danger bg-transparent text-danger border-danger">Saha verisi yüklenemedi.</div>';
    }
}
//KARTLI GÖREV ARŞİVİ
let allLaunchesData = []; 
let currentFilteredData = []; 
let currentPage = 1;
const rowsPerPage = 12; 

async function loadMissionArchive() {
    const gridContainer = document.getElementById('mission-archive-grid');
    const yearSelect = document.getElementById('filter-year');
    const statusSelect = document.getElementById('filter-status');
    
    if (!gridContainer) return;

    try {
        const response = await fetch('https://api.spacexdata.com/v4/launches');
        const data = await response.json();


        allLaunchesData = data.sort((a, b) => new Date(b.date_utc) - new Date(a.date_utc));
        currentFilteredData = allLaunchesData;

        // Yıl Filtresi
        const years = [...new Set(allLaunchesData.map(item => new Date(item.date_utc).getFullYear()))];
        years.forEach(year => {
            yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        });


        renderMissionCards();
        renderPagination();

        statusSelect.addEventListener('change', applyFilters);
        yearSelect.addEventListener('change', applyFilters);

    } catch (error) {
        console.error("Arşiv Hatası:", error);
        gridContainer.innerHTML = '<div class="col-12 text-center text-danger">Veri yüklenemedi.</div>';
    }
}

// FİLTRELERİ UYGULA
function applyFilters() {
    const statusFilter = document.getElementById('filter-status').value;
    const yearFilter = document.getElementById('filter-year').value;

    currentFilteredData = allLaunchesData.filter(launch => {
        const launchYear = new Date(launch.date_utc).getFullYear().toString();
        

        let statusMatch = true;
        if (statusFilter === 'success' && !launch.success) statusMatch = false;
        if (statusFilter === 'fail' && launch.success !== false) statusMatch = false;
        if (statusFilter === 'upcoming' && !launch.upcoming) statusMatch = false;
        if (statusFilter === 'success' && launch.upcoming) statusMatch = false;
        if (statusFilter === 'fail' && launch.upcoming) statusMatch = false;

        // Yıl Kontrolü
        let yearMatch = true;
        if (yearFilter !== 'all' && launchYear !== yearFilter) yearMatch = false;

        return statusMatch && yearMatch;
    });

    currentPage = 1; 
    renderMissionCards();
    renderPagination();
}

// KARTLARI ÇİZ
function renderMissionCards() {
    const gridContainer = document.getElementById('mission-archive-grid');
    const showingInfo = document.getElementById('showing-info');
    
    // Sayfalama Matematiği
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = currentFilteredData.slice(startIndex, endIndex);

    gridContainer.innerHTML = '';

    if (pageData.length === 0) {
        gridContainer.innerHTML = '<div class="col-12 text-center py-5 text-muted">Aradığınız kriterde görev bulunamadı.</div>';
        showingInfo.innerText = '';
        return;
    }

    pageData.forEach(launch => {

        let patchImage = launch.links.patch.small; 
        if (!patchImage) {
            patchImage = 'img/gelecek.png'; 
        }


        let statusBadge = '';
        let statusText = '';
        let statusBorder = ''; 
        
        if (launch.upcoming) {
            statusBadge = 'bg-warning bg-opacity-10 text-warning';
            statusBorder = 'border-warning';
            statusText = 'GELECEK';
        } else if (launch.success) {
            statusBadge = 'bg-success bg-opacity-10 text-success';
            statusBorder = 'border-success';
            statusText = 'BAŞARILI';
        } else {
            statusBadge = 'bg-danger bg-opacity-10 text-danger';
            statusBorder = 'border-danger';
            statusText = 'BAŞARISIZ';
        }

        // Tarihi Formatla 
        const dateStr = new Date(launch.date_utc).toLocaleDateString('tr-TR');


        const cardHTML = `
            <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
                <div class="h-100 p-4 d-flex flex-column text-center transition-card position-relative" 
                     style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                            border: 1px solid #333; 
                            border-radius: 20px;
                            box-shadow: 0 10px 20px rgba(0,0,0,0.3);">
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="text-white-50 small fw-bold" style="letter-spacing: 1px;">#${launch.flight_number}</span>
                        <span class="badge ${statusBadge} border ${statusBorder} small py-2 px-3" style="font-weight: 600;">${statusText}</span>
                    </div>

                    <div class="mb-4 d-flex justify-content-center align-items-center" style="height: 140px;">
                        <img src="${patchImage}" 
                             class="img-fluid img-hover-effect" 
                             style="max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 0 15px rgba(255,255,255,0.15));" 
                             alt="${launch.name}"
                             loading="lazy"
                             onerror="this.src='img/logo_yok.png'"> 
                    </div>

                    <h5 class="fw-bold text-white mb-2 text-uppercase text-truncate" title="${launch.name}" style="letter-spacing: 1px;">
                        ${launch.name}
                    </h5>

                    <p class="text-secondary small mb-4">
                        <i class="bi bi-calendar-event me-1"></i> ${dateStr}
                    </p>

                    <div class="mt-auto">
                        <a href="detail.html?id=${launch.id}" class="btn btn-outline-light w-100 rounded-pill py-2 hover-scale fw-bold" style="border-width: 2px;">
                            İNCELE
                        </a>
                    </div>

                </div>
            </div>
        `;
        gridContainer.innerHTML += cardHTML;
    });

    showingInfo.innerText = `Toplam ${currentFilteredData.length} görevden ${startIndex + 1} - ${Math.min(endIndex, currentFilteredData.length)} arası gösteriliyor.`;
}
// SAYFA BUTONLARI 
function renderPagination() {
    const paginationContainer = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(currentFilteredData.length / rowsPerPage);
    
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;


    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${prevDisabled}">
            <a class="page-link bg-dark text-white border-secondary" href="#" onclick="changePage(${currentPage - 1}); return false;">&laquo;</a>
        </li>
    `;

    // SAYFALAR (Akıllı Kısaltma)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationContainer.innerHTML += `<li class="page-item"><a class="page-link bg-dark text-white border-secondary" href="#" onclick="changePage(1); return false;">1</a></li>`;
        if(startPage > 2) paginationContainer.innerHTML += `<li class="page-item disabled"><span class="page-link bg-dark text-white border-secondary">...</span></li>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        const bgClass = i === currentPage ? 'bg-primary border-primary' : 'bg-dark border-secondary';
        
        paginationContainer.innerHTML += `
            <li class="page-item ${activeClass}">
                <a class="page-link ${bgClass} text-white" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if(endPage < totalPages - 1) paginationContainer.innerHTML += `<li class="page-item disabled"><span class="page-link bg-dark text-white border-secondary">...</span></li>`;
        paginationContainer.innerHTML += `<li class="page-item"><a class="page-link bg-dark text-white border-secondary" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a></li>`;
    }

    // SONRAKİ
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${nextDisabled}">
            <a class="page-link bg-dark text-white border-secondary" href="#" onclick="changePage(${currentPage + 1}); return false;">&raquo;</a>
        </li>
    `;
}

// SAYFA DEĞİŞTİR
function changePage(pageNum) {
    const totalPages = Math.ceil(currentFilteredData.length / rowsPerPage);
    if (pageNum < 1 || pageNum > totalPages) return;
    
    currentPage = pageNum;
    renderMissionCards();
    renderPagination(); 
  
    document.getElementById('mission-archive-section').scrollIntoView({ behavior: 'smooth' });
}



function filterLaunches(type) {
    loadLaunches(type);
}

// G FİLTRELEME
function applyFilters() {

    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const yearFilter = document.getElementById('filter-year').value;


    currentFilteredData = allLaunchesData.filter(launch => {
        const launchYear = new Date(launch.date_utc).getFullYear().toString();
        const launchName = launch.name.toLowerCase();


        if (!launchName.includes(searchInput)) return false;

        // Durum filtresi
        if (statusFilter === 'success' && !launch.success) return false;
        if (statusFilter === 'fail' && launch.success !== false) return false;
        if (statusFilter === 'upcoming' && !launch.upcoming) return false;
        
        // Çakışmayı önle
        if ((statusFilter === 'success' || statusFilter === 'fail') && launch.upcoming) return false;

        // Yıl filtresi
        if (yearFilter !== 'all' && launchYear !== yearFilter) return false;

        return true; 
    });

    // 3. Listeyi Yenile
    currentPage = 1; 
    renderMissionCards();
    renderPagination();
}

if (document.getElementById('mission-archive-grid')) {
    loadMissionArchive();
    
   
    const statusSelect = document.getElementById('filter-status');
    const yearSelect = document.getElementById('filter-year');
    
    if(statusSelect) statusSelect.addEventListener('change', applyFilters);
    if(yearSelect) yearSelect.addEventListener('change', applyFilters);
}