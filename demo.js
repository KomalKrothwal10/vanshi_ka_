// --- 1. Three.js Animated Background Setup ---
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 8;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. Floating Particle Dust System ---
const particleCount = 1800;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const colorPrimary = new THREE.Color(0xff3366);
const colorSecondary = new THREE.Color(0x2a2a40);

for (let i = 0; i < particleCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 20;
  positions[i + 1] = (Math.random() - 0.5) * 20;
  positions[i + 2] = (Math.random() - 0.5) * 20;

  const mixedColor = Math.random() > 0.3 ? colorPrimary : colorSecondary;
  colors[i] = mixedColor.r;
  colors[i + 1] = mixedColor.g;
  colors[i + 2] = mixedColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.035,
  vertexColors: true,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(geometry, particleMaterial);
scene.add(particleSystem);

// --- 3. Floating Geometric Elements ---
const floatingGroup = new THREE.Group();

// Create floating 3D wireframe shapes representing timeline cuts/geometry
const createWireframeCube = (size, x, y, z) => {
  const geo = new THREE.BoxGeometry(size, size, size);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xff3366,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  floatingGroup.add(mesh);
  return mesh;
};

const cube1 = createWireframeCube(1.2, -4, 2, -2);
const cube2 = createWireframeCube(0.8, 4.5, -2, -1);
const cube3 = createWireframeCube(1.5, 3.5, 3, -3);

scene.add(floatingGroup);

// --- 4. Interactive Mouse Tracking ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// --- 5. Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Smooth lerp for mouse motion
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  // Move camera slightly based on mouse position
  camera.position.x = targetX * 0.8;
  camera.position.y = targetY * 0.8;
  camera.lookAt(scene.position);

  // Rotate particle field
  particleSystem.rotation.y = elapsedTime * 0.03;
  particleSystem.rotation.x = elapsedTime * 0.01;

  // Rotate wireframe cubes
  cube1.rotation.x = elapsedTime * 0.3;
  cube1.rotation.y = elapsedTime * 0.4;

  cube2.rotation.x = -elapsedTime * 0.2;
  cube2.rotation.z = elapsedTime * 0.3;

  cube3.rotation.y = elapsedTime * 0.25;

  renderer.render(scene, camera);
}

animate();

// --- 6. Window Resize Handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 7. 3D Tilt Card Effect (Glass Portrait) ---
const card = document.getElementById('tilt-card');

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -12;
  const rotateY = ((x - centerX) / centerX) * 12;

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
});

card.addEventListener('mouseleave', () => {
  card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
});

// --- 8. Entrance GSAP Animations ---
gsap.from('.hero-content > *', {
  opacity: 0,
  y: 30,
  duration: 1,
  stagger: 0.15,
  ease: 'power3.out'
});

gsap.from('.hero-visual', {
  opacity: 0,
  scale: 0.9,
  duration: 1.2,
  delay: 0.3,
  ease: 'power3.out'
});


document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.showreel-card');
  const tabs = document.querySelectorAll('.filter-tab');
  const modal = document.getElementById('videoModal');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const closeModalBtn = document.getElementById('closeModal');
  const player = document.getElementById('videoPlayer');
  const frameContainer = document.getElementById('frameContainer');

  // Default initial view: show 'short' items on page load
  filterCategory('short');

  // 1. Filter Switch Logic
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      filterCategory(filter);
    });
  });

  function filterCategory(category) {
    cards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      if (cardCategory === category) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // 2. Open Modal Video Popup
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const videoId = card.getAttribute('data-video-id');
      const isVertical = card.classList.contains('vertical');

      if (!videoId) return;

      // Toggle aspect ratio for vertical Shorts vs horizontal videos
      if (isVertical) {
        frameContainer.classList.add('vertical-frame');
      } else {
        frameContainer.classList.remove('vertical-frame');
      }

      player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // 3. Close Modal
  function closeModal() {
    modal.classList.remove('open');
    player.src = '';
    document.body.style.overflow = '';
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
});

/* ==========================================================================
   SECTION 3: SERVICES & PACKAGES (INTERACTIVE HOVER & CTA HANDLING)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const packageCards = document.querySelectorAll('.package-card');
  const packageButtons = document.querySelectorAll('.btn-package');

  if (!packageCards.length) return;

  // 1. Subtle 3D Tilt Effect on Package Hover
  packageCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse X position inside card
      const y = e.clientY - rect.top;  // Mouse Y position inside card

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate slight rotation degree (-4 to +4 deg max)
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    // Reset card transform on mouse leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // 2. Smooth Scroll & Prefill Contact Form on Button Click
  packageButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('href');
      
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const contactSection = document.querySelector(targetId);
        
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });

          // Optional: If you have a package dropdown/select in your contact form, pre-select the chosen package
          const packageTitle = btn.closest('.package-card')?.querySelector('h3')?.innerText;
          const serviceSelect = document.getElementById('service-select'); // Ensure your contact form select has id="service-select"
          
          if (serviceSelect && packageTitle) {
            for (let option of serviceSelect.options) {
              if (option.text.toLowerCase().includes(packageTitle.toLowerCase())) {
                option.selected = true;
                break;
              }
            }
          }
        }
      }
    });
  });
});

/* ==========================================================================
   SECTION 4: WORKFLOW INTERACTION & ANIMATION ON SCROLL
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const workflowSteps = document.querySelectorAll('.workflow-step');

  if (!workflowSteps.length) return;

  // Highlight active timeline node on scroll
  const observerOptions = {
    threshold: 0.4
  };

  const workflowObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('step-active');
        const node = entry.target.querySelector('.step-node');
        if (node) {
          node.style.borderColor = '#ff3366';
          node.style.transform = 'scale(1.08)';
        }
      }
    });
  }, observerOptions);

  workflowSteps.forEach((step) => {
    workflowObserver.observe(step);
  });
});



// show reel - 2 
/* ==========================================================================
   SHOWREEL TAB FILTERING & VIDEO MANAGEMENT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const showreelCards = document.querySelectorAll('.showreel-card');

  if (!filterTabs.length || !showreelCards.length) return;

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // 1. Set Active Tab State
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      // 2. Pause all playing videos when switching tabs
      document.querySelectorAll('.showreel-video').forEach((video) => {
        if (!video.paused) {
          video.pause();
        }
      });

      // 3. Filter Cards
      showreelCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');

        if (cardCategory === filterValue) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    });
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        if (filterValue === 'all' || card.classList.contains(filterValue)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});

    document.addEventListener('DOMContentLoaded', () => {
      const vXNavBtns = document.querySelectorAll('.vX-nav-btn');
      const vXSecGroups = document.querySelectorAll('.vX-sec-group');

      vXNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          vXNavBtns.forEach(b => b.classList.remove('vX-active'));
          btn.classList.add('vX-active');

          const targetType = btn.getAttribute('data-vx-target');

          document.querySelectorAll('video').forEach(vid => vid.pause());

          vXSecGroups.forEach(sec => {
            const secType = sec.getAttribute('data-vx-type');
            if (targetType === 'all' || targetType === secType) {
              sec.classList.remove('vX-is-hidden');
            } else {
              sec.classList.add('vX-is-hidden');
            }
          });
        });
      });
    });
