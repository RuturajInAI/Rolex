import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

// --- DOM Elements ---
const nav = document.getElementById('navbar');
const menuBtn = document.getElementById('menu-btn');
const navUl = nav?.querySelector('ul');
const typingText = document.getElementById('typing-text');
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
const loader = document.getElementById('loader');
const skillsCanvas = document.getElementById('skills-canvas') as HTMLCanvasElement;
const profileCanvas = document.getElementById('profile-canvas') as HTMLCanvasElement;

// Modal Elements
const chatBubble = document.getElementById('chat-bubble');
const chatModalContainer = document.getElementById('chat-modal-container');
const emailModalContainer = document.getElementById('email-modal-container');
const getInTouchBtn = document.getElementById('get-in-touch-btn');
const modalContainers = document.querySelectorAll('.modal-container');


// --- Typing Animation ---
const words = ["PLC Programmer", "SCADA Specialist", "Commissioning Engineer"];
let i = 0;
let j = 0;
let currentWord = "";
let isDeleting = false;

function type() {
    if(!typingText) return;
    currentWord = words[i];
    if (isDeleting) {
        j--;
        typingText.textContent = currentWord.substring(0, j);
    } else {
        j++;
        typingText.textContent = currentWord.substring(0, j);
    }

    if (!isDeleting && j === currentWord.length) {
        setTimeout(() => isDeleting = true, 2000);
    } else if (isDeleting && j === 0) {
        isDeleting = false;
        i = (i + 1) % words.length;
    }

    const typingSpeed = isDeleting ? 100 : 200;
    setTimeout(type, typingSpeed);
}

// --- Navbar Scroll Effect ---
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
    } else {
        nav?.classList.remove('scrolled');
    }
});

// --- Mobile Menu Toggle ---
menuBtn?.addEventListener('click', () => {
    navUl?.classList.toggle('active');
});

// --- Scroll Reveal Animation ---
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    revealObserver.observe(el);
});


// --- "Read More" Toggle ---
const readMoreBtns = document.querySelectorAll('.read-more-btn');
readMoreBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const parent = btn.parentElement;
        parent?.classList.toggle('expanded');
        if (parent?.classList.contains('expanded')) {
            btn.textContent = 'Read Less';
        } else {
            btn.textContent = 'Read More';
        }
    });
});

// --- Profile Picture Canvas Animation ---
if (profileCanvas) {
    const p_ctx = profileCanvas.getContext('2d');
    profileCanvas.width = 200;
    profileCanvas.height = 200;
    let p_particlesArray: ProfileParticle[] = [];
    const p_numberOfParticles = 40;
    const center = { x: profileCanvas.width / 2, y: profileCanvas.height / 2 };
    
    let mouseHover = false;
    const profilePicContainer = document.querySelector('.profile-pic-container');
    profilePicContainer?.addEventListener('mouseenter', () => mouseHover = true);
    profilePicContainer?.addEventListener('mouseleave', () => mouseHover = false);

    class ProfileParticle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        life: number;
        maxLife: number;

        constructor() {
            this.x = center.x;
            this.y = center.y;
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 1.5) + 0.5;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
            this.size = (Math.random() * 1.5) + 1;
            this.maxLife = Math.random() * 60 + 40;
            this.life = this.maxLife;
        }

        update() {
            this.x += this.speedX * (mouseHover ? 1.5 : 1);
            this.y += this.speedY * (mouseHover ? 1.5 : 1);
            this.life -= 1;
            if (this.life <= 0) {
                this.reset();
            }
        }
        
        reset() {
            this.x = center.x;
            this.y = center.y;
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 1.5) + 0.5;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
            this.life = this.maxLife;
        }

        draw() {
            if (p_ctx) {
                p_ctx.fillStyle = `rgba(0, 255, 204, ${this.life / this.maxLife * 0.8})`;
                p_ctx.beginPath();
                p_ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                p_ctx.closePath();
                p_ctx.fill();
            }
        }
    }

    function p_init() {
        p_particlesArray = [];
        for (let i = 0; i < p_numberOfParticles; i++) {
            p_particlesArray.push(new ProfileParticle());
        }
    }

    function p_connect() {
        if (!p_ctx) return;
        let opacityValue = 1;
        for (let a = 0; a < p_particlesArray.length; a++) {
            for (let b = a; b < p_particlesArray.length; b++) {
                const distance = Math.sqrt(
                    Math.pow(p_particlesArray[a].x - p_particlesArray[b].x, 2) +
                    Math.pow(p_particlesArray[a].y - p_particlesArray[b].y, 2)
                );
                
                if (distance < 35) { // Connection distance
                    opacityValue = 1 - (distance / 35);
                    p_ctx.strokeStyle = `rgba(255, 0, 255, ${opacityValue * 0.5})`;
                    p_ctx.lineWidth = 1;
                    p_ctx.beginPath();
                    p_ctx.moveTo(p_particlesArray[a].x, p_particlesArray[a].y);
                    p_ctx.lineTo(p_particlesArray[b].x, p_particlesArray[b].y);
                    p_ctx.stroke();
                }
            }
        }
    }

    function p_animate() {
        if (p_ctx) {
            p_ctx.clearRect(0, 0, profileCanvas.width, profileCanvas.height);
            for (const particle of p_particlesArray) {
                particle.update();
                particle.draw();
            }
            p_connect();
        }
        requestAnimationFrame(p_animate);
    }

    p_init();
    p_animate();
}

// --- Skills Canvas Animation ---
if (skillsCanvas) {
    const ctx = skillsCanvas.getContext('2d');
    let particlesArray: Particle[] = [];
    const numberOfParticles = 80;

    const skillsSection = document.getElementById('skills');

    const setCanvasSize = () => {
        if (skillsSection && ctx) {
            skillsCanvas.width = skillsSection.offsetWidth;
            skillsCanvas.height = skillsSection.offsetHeight;
        }
    };

    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (event) => {
        const rect = skillsCanvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    skillsSection?.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        x: number;
        y: number;
        directionX: number;
        directionY: number;
        size: number;
        color: string;

        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            if (ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = 'rgba(0, 255, 204, 0.5)';
                ctx.fill();
            }
        }

        update() {
            if (this.x > skillsCanvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > skillsCanvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            const size = (Math.random() * 2) + 1;
            const x = (Math.random() * (skillsCanvas.width - size * 2) + size);
            const y = (Math.random() * (skillsCanvas.height - size * 2) + size);
            const directionX = (Math.random() * .4) - .2;
            const directionY = (Math.random() * .4) - .2;
            const color = 'rgba(0, 255, 204, 0.5)';
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function connect() {
        if (!ctx) return;
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (skillsCanvas.width / 7) * (skillsCanvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(0, 255, 204, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        if (ctx) {
            ctx.clearRect(0, 0, skillsCanvas.width, skillsCanvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }
    }
    
    window.addEventListener('resize', () => {
        setCanvasSize();
        init();
    });

    setCanvasSize();
    init();
    animate();
}

// --- Gemini AI Assistant ---
let ai;
try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    addMessageToHistory('ai', 'Error: AI service could not be initialized. Please check the API key configuration.');
}

const getResumeContext = () => {
    return `
        This is the resume information for Ruturaj Dilip Gawade. Use this data to answer questions.

        --- START OF RESUME ---

        Ruturaj Dilip Gawade
        +49 15560133862 | ruturajabroad@gmail.com | Walther-Rathenau-Straße 55, 39104 Magdeburg | LinkedIn

        PROFILE
        Automation & Commissioning Engineer with 3 years of hands-on experience in PLC, HMI, and SCADA-based industrial automation, delivering projects for clients of German, Italian, UK, US, and Indian origin. Proficient in Siemens, Allen-Bradley, and Mitsubishi automation platforms with exposure to Beckhoff (TwinCAT) and Schneider control environments. Experienced in commissioning, troubleshooting, field integration, and remote customer support, ensuring reliable system performance under real production conditions. Currently pursuing M.Sc. in Digital Engineering at Otto von Guericke University Magdeburg, specializing in real-time industrial data synchronization and control system integration. Fluent in English (C1) and German (A2).

        PROFESSIONAL EXPERIENCE
        Automation & Commissioning Engineer
        Promatics Solutions | 03.2021 - 04.2024 | Pune, India
        Executed automation and process control projects for multiple international clients, focusing on PLC/HMI logic development, on-site commissioning, fault analysis, and customer handover documentation.

        Key Projects:
        - Automotive Test Loop Line (German Client): Developed PLC/HMI logic in Mitsubishi FX5U / GX Works 3 for conveyors, turntables, presses. Conducted simulation and field commissioning.
        - Boiler House Automation (Indian Client): Programmed a Siemens S7-1200-based boiler house with WinCC SCADA. Managed production trials and resolved signal scaling issues.
        - Multi-Lift & Conveyor Automation System (UK Client): Modified and commissioned Allen-Bradley CompactLogix / FactoryTalk View ME logic for lift synchronization.
        - Tea Production Plant Automation (Indian Client): Delivered full-plant automation using Siemens S7-1200 and WinCC Runtime Advanced. Handled PID tuning, alarm setup, and remote support.
        - Wheel Hub & Hydraulic Press Machines (US Client): Designed and programmed servo/stepper-based press systems with Siemens S7-1200 and AutoCAD Electrical. Oversaw on-site commissioning and MES communication.
        - Axle & Wheel Hub Stud Press Line (Italian Client): Modified and validated PLC-HMI systems with OPC UA-based data exchange. Added safety-curtain logic.
        - Spices Grinding & Packing Automation (Indian Client): Developed and commissioned five independent grinding lines under a centralized SCADA using Siemens S7-1400 / TIA Portal V14.
        - Multi-Station Axle & Bearing Assembly SCADA (Italian Client): Enhanced ASEM HMI and Industrial PC SCADA connected to Siemens S7-1200/1500 PLCs. Reorganized ≈1800 alarms and implemented recipe management.
        - Pharma Powder Conveying & Grinding Automation (Indian Client): Commissioned Allen-Bradley CompactLogix 5370 / FactoryTalk View ME system. Verified I/O signals and calibrated transmitters.

        EDUCATION
        - Master in Digital Engineering (04.2024 – Present)
          Otto von Guericke University Magdeburg, Germany
          Key Competencies: Industrial Automation & Control Systems, PLC & SCADA Integration, IoT & Edge Data Communication, Robotics & Machine Vision, Cybersecurity.
        - Bachelor of Technology in Electrical Engineering (06.2020 - 07.2023)
          Savitribai Phule Pune University, India
          Key Competencies: PLC Programming & HMI Development, Industrial Instrumentation, Control Systems & Automation.

        ACADEMIC PROJECTS
        - (M.Sc.) Environmental Representation of Autonomous Robots: Developed a LiDAR- and radar-based detection system for an autonomous robot to classify humans vs. non-humans.
        - (M.Sc.) Smart City Traffic Control and Safety Analysis: Designed a traffic simulation model in AnyLogic using real sensor data from Magdeburg City.
        - (B.Tech.) PLC Development Using Arduino and Factory I/O Simulation: Built a low-cost automation prototype to simulate a complete packaging line.

        TECHNICAL SKILLS
        - PLC/SCADA Platforms: Siemens (TIA Portal, S7-1200/1400, WinCC), Allen-Bradley (CompactLogix, Studio 5000, FactoryTalk), Mitsubishi (FX5U, GX Works 3), Beckhoff TwinCAT, Schneider EcoStruxure.
        - Protocols & Interfaces: OPC UA, Modbus TCP, MES, IIoT, Profinet, EtherCAT, EtherNet/IP.
        - Core Skills: PLC Programming, HMI Design, SCADA Configuration, Commissioning, Troubleshooting, PID Control, Motion & Servo Integration, Safety Interlocks, Alarm & Data Handling, Recipe Management.

        PROFESSIONAL SKILLS
        System Commissioning, Troubleshooting & Testing, Emergency Site Support, PLC-HMI Integration, Field Device Configuration, Remote Monitoring & Customer Support, Documentation & Validation, Team Coordination.

        LANGUAGES
        - English: C1 (IELTS)
        - German: A2 (currently improving)

        --- END OF RESUME ---
    `;
};

async function handleSendMessage() {
    if (!ai) {
        addMessageToHistory('ai', 'AI is not available.');
        return;
    }

    const question = chatInput.value.trim();
    if (!question) return;

    addMessageToHistory('user', question);
    chatInput.value = '';
    showLoader(true);

    try {
        const resumeContext = getResumeContext();
        const fullPrompt = `${resumeContext}\n\nBased on the information above, answer the following question as Ruturaj's helpful AI assistant: "${question}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        const text = response.text;
        addMessageToHistory('ai', text);

    } catch (error) {
        console.error("Error generating content:", error);
        addMessageToHistory('ai', 'Sorry, I encountered an error. Please try again.');
    } finally {
        showLoader(false);
    }
}

function addMessageToHistory(sender: 'user' | 'ai', message: string) {
    if (!chatHistory) return;
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    
    // Naive markdown-like formatting for bold and lists
    let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedMessage = formattedMessage.replace(/^\* (.*$)/gm, '<li>$1</li>');
    if(formattedMessage.includes('<li>')) {
        formattedMessage = `<ul>${formattedMessage}</ul>`;
    }

    messageElement.innerHTML = formattedMessage;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showLoader(show: boolean) {
    if (!loader || !sendBtn) return;
    if (show) {
        loader.classList.remove('hidden');
        sendBtn.disabled = true;
    } else {
        loader.classList.add('hidden');
        sendBtn.disabled = false;
    }
}

// --- Modal Logic ---
function openModal(modal: HTMLElement | null) {
    if (modal) modal.classList.add('active');
}

function closeModal() {
    modalContainers.forEach(modal => modal.classList.remove('active'));
}

chatBubble?.addEventListener('click', () => openModal(chatModalContainer));
getInTouchBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(emailModalContainer);
});

modalContainers.forEach(modal => {
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});


// --- Event Listeners & Initializations ---
document.addEventListener('DOMContentLoaded', () => {
    type();
    addMessageToHistory('ai', "Hello! I am Ruturaj's AI assistant. Feel free to ask me anything about his resume.");
});

sendBtn?.addEventListener('click', handleSendMessage);
chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// --- Smooth Scrolling and Modal/Menu Management ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (navUl && navUl.contains(anchor)) {
            navUl.classList.remove('active');
        }

        if (targetId === '#contact') {
            openModal(chatModalContainer);
        } else if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});
