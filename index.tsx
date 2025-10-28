
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


// --- Typing Animation ---
const words = ["PLC Programmer", "SCADA Specialist", "Commissioning Engineer"];
let i = 0;
let j = 0;
let currentWord = "";
let isDeleting = false;

function type() {
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
            // We don't unobserve, so animations can re-trigger if needed, or adjust logic here
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
    // Scrape data from the page to provide context to the AI
    const about = document.getElementById('about')?.innerText;
    const skills = document.getElementById('skills')?.innerText;
    const experience = document.getElementById('experience')?.innerText;
    const projects = document.getElementById('projects')?.innerText;
    return `
        This is the resume information for Ruturaj Gawade, an Automation & Control Engineer.
        ---
        ABOUT: ${about}
        ---
        SKILLS: ${skills}
        ---
        EXPERIENCE: ${experience}
        ---
        PROJECTS: ${projects}
        ---
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

// --- Event Listeners ---
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

// --- Smooth Scrolling and Mobile Menu Management ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default anchor behavior to avoid routing issues.

        // Close mobile menu if the link is inside it
        if (navUl && navUl.contains(anchor)) {
            navUl.classList.remove('active');
        }

        const targetId = this.getAttribute('href');
        // Make sure we have a valid target ID
        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});