document.addEventListener('DOMContentLoaded', () => {

    // --- Particle Background Initialization ---
    tsParticles.load({
        id: "particles-js",
        options: {
            background: { color: { value: "#00000a" } },
            fpsLimit: 60,
            interactivity: {
                events: {
                    onHover: { enable: true, mode: "repulse" },
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                },
            },
            particles: {
                color: { value: "#ffffff" },
                links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
                move: {
                    direction: "none",
                    enable: true,
                    outModes: { default: "out" },
                    random: true,
                    speed: 0.5,
                    straight: false,
                },
                number: { density: { enable: true }, value: 80 },
                opacity: { value: { min: 0.1, max: 0.5 } },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
        },
    });

    // --- Navigation ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });

            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');

            const targetSection = document.getElementById(targetId);
            if (targetId === 'reprogramacion' && !targetSection.dataset.initialized) {
                initializeChallenge();
                targetSection.dataset.initialized = 'true';
            }
            if (targetId === 'diario' && !targetSection.dataset.initialized) {
                initializeDiary();
                targetSection.dataset.initialized = 'true';
            }
        });
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Affirmations: Voice Recording ---
    const recordBtn = document.getElementById('record-btn');
    const recordLabel = document.getElementById('record-label');
    const statusDiv = document.getElementById('recording-status');
    const recordingsList = document.getElementById('recordings-list');
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    recordBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    createAudioPlayer(audioUrl);
                    audioChunks = [];
                    stream.getTracks().forEach(track => track.stop()); // Stop microphone access
                });

                isRecording = true;
                recordBtn.classList.add('recording');
                recordLabel.textContent = 'Detener Grabación';
                statusDiv.textContent = 'Grabando... Habla con intención.';
            } catch (err) {
                statusDiv.textContent = 'Error: No se pudo acceder al micrófono.';
                console.error("Error al acceder al micrófono:", err);
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordBtn.classList.remove('recording');
            recordLabel.textContent = 'Grabar Voz';
            statusDiv.textContent = 'Grabación finalizada.';
        }
    });

    function createAudioPlayer(audioUrl) {
        const affirmationText = document.getElementById('affirmation-text').value || "Grabación de voz";
        const recordingElement = document.createElement('div');
        recordingElement.className = 'alert alert-secondary';
        recordingElement.innerHTML = `
            <p class="mb-2"><strong>${affirmationText}</strong></p>
            <audio controls src="${audioUrl}"></audio>
            <button class="btn btn-sm btn-danger mt-2 delete-recording">Eliminar</button>
        `;
        recordingsList.prepend(recordingElement);

        recordingElement.querySelector('.delete-recording').addEventListener('click', () => {
            recordingElement.remove();
        });
    }

    // --- Activation: 963 Hz Frequency ---
    const freqBtn = document.getElementById('freq-btn');
    let audioContext;
    let oscillator;
    let gainNode;
    let isPlaying = false;

    freqBtn.addEventListener('click', () => {
        if (!isPlaying) {
            // Initialize AudioContext on user interaction
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // If context was suspended, resume it
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            oscillator = audioContext.createOscillator();
            gainNode = audioContext.createGain();

            oscillator.frequency.setValueAtTime(963, audioContext.currentTime); // 963 Hz
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.5); // Fade in

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            isPlaying = true;
            freqBtn.textContent = 'Desactivar Frecuencia 963 Hz';
            freqBtn.classList.remove('btn-outline-light');
            freqBtn.classList.add('btn-light');
        } else {
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5); // Fade out
            oscillator.stop(audioContext.currentTime + 0.5);
            isPlaying = false;
            freqBtn.textContent = 'Activar Frecuencia 963 Hz';
            freqBtn.classList.add('btn-outline-light');
            freqBtn.classList.remove('btn-light');
        }
    });

    // --- Reprogramación 21 Días ---
    const affirmations = [
        "Yo soy el arquitecto de mi realidad y construyo mis cimientos sobre la alegría y el amor.",
        "Mi mente es un imán para los milagros, y atraigo oportunidades maravillosas sin esfuerzo.",
        "Cada célula de mi cuerpo vibra en la frecuencia de la salud perfecta y la vitalidad.",
        "Libero todo el pasado y me abro a la infinita abundancia del presente.",
        "Mi corazón es un centro de poder y amor incondicional que transforma todo lo que toca.",
        "Confío plenamente en el proceso de la vida; estoy seguro y a salvo.",
        "La prosperidad fluye hacia mí desde todas las direcciones de formas esperadas e inesperadas.",
        "Mi voz interior es mi guía más sabia, y la escucho con claridad y confianza.",
        "Estoy conectado con la energía creativa del universo, y mis ideas son valiosas y poderosas.",
        "Perdono a todos, incluyéndome a mí mismo, y me libero de toda carga emocional.",
        "Mi potencial es ilimitado, y cada día me expando más allá de mis antiguas fronteras.",
        "Estoy agradecido por todo lo que tengo, y esta gratitud multiplica mis bendiciones.",
        "Merezco todo lo bueno, y lo acepto en mi vida con los brazos abiertos.",
        "La paz interior es mi estado natural, y regreso a ella con cada respiración.",
        "Mis relaciones son espejos de amor y respeto mutuo.",
        "Atraigo a las personas correctas en el momento perfecto para mi más alto bien.",
        "Cada desafío es una oportunidad para crecer más fuerte, más sabio y más resiliente.",
        "Mi energía es sagrada y la protejo, invirtiéndola solo en lo que me nutre y eleva.",
        "Yo soy suficiente. Mi valor no depende de la validación externa.",
        "El universo me apoya incondicionalmente en la manifestación de mis sueños.",
        "He renacido. Soy una nueva versión de mí mismo, alineado con mi propósito divino."
    ];

    const STORAGE_KEY = 'godModeChallengeProgress';
    let completedDays = [];

    function saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDays));
    }

    function loadProgress() {
        const progress = localStorage.getItem(STORAGE_KEY);
        completedDays = progress ? JSON.parse(progress) : [];
        completedDays.forEach(day => {
            const card = document.getElementById(`day-${day}`);
            const checkbox = document.getElementById(`check-day-${day}`);
            if (card) card.classList.add('completed');
            if (checkbox) checkbox.checked = true;
        });
    }

    function initializeChallenge() {
        const grid = document.getElementById('challenge-grid');
        grid.innerHTML = ''; // Clear previous content if any

        affirmations.forEach((affirmation, index) => {
            const day = index + 1;
            const cardHTML = `
                <div class="col">
                    <div class="day-card" id="day-${day}" data-day="${day}">
                        <div class="day-header">
                            <span class="day-number">Día ${day}</span>
                            <span class="medal-icon">✦</span>
                        </div>
                        <div class="affirmation-content">
                            <p>"${affirmation}"</p>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="check-day-${day}" data-day="${day}">
                            <label class="form-check-label" for="check-day-${day}">Completado</label>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += cardHTML;
        });

        grid.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const day = parseInt(e.target.dataset.day);
                const card = document.getElementById(`day-${day}`);
                if (e.target.checked) {
                    card.classList.add('completed');
                    if (!completedDays.includes(day)) {
                        completedDays.push(day);
                    }
                } else {
                    card.classList.remove('completed');
                    completedDays = completedDays.filter(d => d !== day);
                }
                saveProgress();
            }
        });

        loadProgress();
    }
    
    // --- Diario de Resultados ---
    const DIARY_STORAGE_KEY = 'godModeDiaryEntries';
    const PROGRESS_STORAGE_KEY = 'godModeRealityProgress';

    function initializeDiary() {
        const saveBtn = document.getElementById('save-entry-btn');
        const progressSlider = document.getElementById('reality-progress-slider');

        saveBtn.addEventListener('click', saveDiaryEntry);
        progressSlider.addEventListener('input', updateProgress);
        
        loadDiaryEntries();
        loadRealityProgress();
    }

    function updateProgress() {
        const slider = document.getElementById('reality-progress-slider');
        const percentageDisplay = document.getElementById('progress-percentage');
        const progressBar = document.getElementById('reality-progress-bar');
        const value = slider.value;

        percentageDisplay.textContent = `${value}%`;
        progressBar.style.width = `${value}%`;
        progressBar.setAttribute('aria-valuenow', value);

        localStorage.setItem(PROGRESS_STORAGE_KEY, value);
    }

    function loadRealityProgress() {
        const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY) || '0';
        document.getElementById('reality-progress-slider').value = savedProgress;
        updateProgress();
    }

    function saveDiaryEntry() {
        const changes = document.getElementById('diary-changes').value;
        const sincronicities = document.getElementById('diary-sincronicities').value;
        const emotions = document.getElementById('diary-emotions').value;
        
        if (!changes && !sincronicities && !emotions) {
            alert('Por favor, rellena al menos un campo para guardar la entrada.');
            return;
        }

        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
            changes,
            sincronicities,
            emotions
        };

        const entries = JSON.parse(localStorage.getItem(DIARY_STORAGE_KEY) || '[]');
        entries.unshift(newEntry);
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));

        // Clear fields
        document.getElementById('diary-changes').value = '';
        document.getElementById('diary-sincronicities').value = '';
        document.getElementById('diary-emotions').value = '';

        loadDiaryEntries(); // Refresh the list
    }

    function loadDiaryEntries() {
        const entriesList = document.getElementById('diary-entries-list');
        const entries = JSON.parse(localStorage.getItem(DIARY_STORAGE_KEY) || '[]');
        entriesList.innerHTML = '';

        if (entries.length === 0) {
            entriesList.innerHTML = '<p class="col">Aún no has guardado ninguna entrada en tu diario.</p>';
            return;
        }

        entries.forEach(entry => {
            const entryCard = document.createElement('div');
            entryCard.className = 'col';
            entryCard.innerHTML = `
                <div class="diary-card">
                    <div class="diary-card-header">
                        <span class="diary-date">${entry.date}</span>
                        <button class="btn-close btn-close-white delete-entry-btn" data-id="${entry.id}"></button>
                    </div>
                    <div class="diary-card-body">
                        ${entry.changes ? `<p><strong>Cambios:</strong> ${entry.changes}</p>` : ''}
                        ${entry.sincronicities ? `<p><strong>Señales/Sincronicidades:</strong> ${entry.sincronicities}</p>` : ''}
                        ${entry.emotions ? `<p><strong>Emociones/Sueños/Ideas:</strong> ${entry.emotions}</p>` : ''}
                    </div>
                </div>
            `;
            entriesList.appendChild(entryCard);
        });
        
        // Add delete listeners
        document.querySelectorAll('.delete-entry-btn').forEach(button => {
            button.addEventListener('click', deleteDiaryEntry);
        });
    }

    function deleteDiaryEntry(event) {
        const entryId = parseInt(event.target.dataset.id);
        let entries = JSON.parse(localStorage.getItem(DIARY_STORAGE_KEY) || '[]');
        entries = entries.filter(entry => entry.id !== entryId);
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
        loadDiaryEntries(); // Refresh list
    }
});