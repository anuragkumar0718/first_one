import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import './App.css'

/* ===== PARTICLE BACKGROUND ===== */
function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let mouse = { x: -1000, y: -1000 }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouse)

    class Particle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.1
        this.hue = Math.random() * 60 + 240 // purple to cyan range
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Mouse interaction
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          this.x -= dx * 0.01
          this.y -= dy * 0.01
          this.opacity = Math.min(this.opacity + 0.02, 0.8)
        }

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`
        ctx.fill()
      }
    }

    for (let i = 0; i < 100; i++) {
      particles.push(new Particle())
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.update()
        p.draw()
      })
      drawConnections()
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

/* ===== ANIMATED SECTION WRAPPER ===== */
function AnimatedSection({ children, className, id }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.section>
  )
}

/* ===== STAGGERED CHILDREN ===== */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

/* ===== MAGNETIC BUTTON ===== */
function MagneticButton({ children, className, onClick }) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
  }

  const handleMouseLeave = () => {
    ref.current.style.transform = 'translate(0, 0)'
    ref.current.style.transition = 'transform 0.4s ease'
  }

  return (
    <button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  )
}

/* ===== TEXT REVEAL ===== */
function TextReveal({ text, className }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const words = text.split(' ')

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.04 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

/* ===== COUNTER ANIMATION ===== */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ===== BLOG DATA ===== */
const blogPosts = [
  {
    id: 1,
    title: "Hello World! This Is My First Website 🎉",
    excerpt: "After months of learning HTML, CSS, and JavaScript, I finally did it! This is the story of how I built my very first website from scratch.",
    date: "Aug 25, 2026",
    tags: ["first", "journey"],
    color: "#8b5cf6",
    readTime: "5 min",
    featured: true
  },
  {
    id: 2,
    title: "Why I Chose React For My First Project",
    excerpt: "React felt like magic when I first saw components. Here's why I picked it over Vue, Angular, and Svelte for my first real project.",
    date: "Aug 24, 2026",
    tags: ["react", "journey"],
    color: "#06b6d4",
    readTime: "4 min"
  },
  {
    id: 3,
    title: "CSS Animations Are Ridiculously Fun",
    excerpt: "From simple hover effects to complex keyframe animations — CSS became my playground. Let me show you what I learned!",
    date: "Aug 23, 2026",
    tags: ["css", "journey"],
    color: "#ec4899",
    readTime: "6 min"
  },
  {
    id: 4,
    title: "The JavaScript Journey: From Zero to Animations",
    excerpt: "Variables, functions, DOM manipulation, and then... Framer Motion. My JavaScript journey has been one wild ride.",
    date: "Aug 22, 2026",
    tags: ["js", "journey"],
    color: "#10b981",
    readTime: "7 min"
  },
  {
    id: 5,
    title: "Things I Wish I Knew Before Starting Web Dev",
    excerpt: "If I could go back and tell past-me some things about web development, here's what I'd say. Spoiler: it's not about the code.",
    date: "Aug 21, 2026",
    tags: ["journey", "first"],
    color: "#3b82f6",
    readTime: "4 min"
  },
  {
    id: 6,
    title: "Building a Design System From Scratch",
    excerpt: "Colors, typography, spacing tokens — I built a complete design system for this blog and it changed everything about how I code UI.",
    date: "Aug 20, 2026",
    tags: ["css", "react"],
    color: "#a855f7",
    readTime: "8 min"
  }
]

const techStack = [
  { name: "React", icon: "⚛️", level: "Learning" },
  { name: "JavaScript", icon: "🟨", level: "Intermediate" },
  { name: "CSS3", icon: "🎨", level: "Getting There" },
  { name: "HTML5", icon: "📄", level: "Comfortable" },
  { name: "Vite", icon: "⚡", level: "Using It!" },
  { name: "Framer Motion", icon: "🎬", level: "Exploring" },
  { name: "Git", icon: "🔀", level: "Basics" },
  { name: "VS Code", icon: "💻", level: "Daily Driver" },
]

const timelineData = [
  {
    date: "August 2026",
    title: "🚀 Launched My First Website!",
    desc: "This very website you're looking at right now. Built with React, Vite, and Framer Motion. I can't believe I actually did it!"
  },
  {
    date: "July 2026",
    title: "⚛️ Started Learning React",
    desc: "Components, state, props — it was like learning a new language. But once it clicked, everything changed."
  },
  {
    date: "June 2026",
    title: "🎨 Fell In Love with CSS",
    desc: "Flexbox, Grid, animations... CSS went from frustrating to fascinating. I spent hours just making things move on screen."
  },
  {
    date: "May 2026",
    title: "🟨 JavaScript Clicked",
    desc: "After weeks of struggling with callbacks and async, JavaScript finally started making sense. DOM manipulation felt like superpowers."
  },
  {
    date: "April 2026",
    title: "📄 Hello, HTML!",
    desc: "My very first HTML page. Just a heading, a paragraph, and an image. But seeing it render in the browser? Pure magic."
  }
]

/* ===== MAIN APP ===== */
function App() {
  const [scrolled, setScrolled] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { scrollYProgress } = useScroll()
  const heroRef = useRef(null)

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouse)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  const featuredPost = blogPosts.find(p => p.featured)
  const regularPosts = blogPosts.filter(p => !p.featured)

  return (
    <>
      <ParticleBackground />

      {/* Cursor Glow */}
      <div
        className="cursor-glow"
        style={{ left: mousePos.x, top: mousePos.y }}
      />

      {/* Progress Bar */}
      <motion.div
        style={{
          scaleX: scrollYProgress,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4)',
          transformOrigin: '0%',
          zIndex: 200
        }}
      />

      {/* ===== NAVBAR ===== */}
      <motion.nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="nav-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          &lt;FirstOne /&gt;
        </motion.div>
        <ul className="nav-links">
          {['Home', 'About', 'Blog', 'Journey', 'Stack'].map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <a href={`#${item.toLowerCase()}`}>{item}</a>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      {/* ===== HERO ===== */}
      <section className="hero-section" id="home" ref={heroRef}>
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-bg-orb orb-3" />

        <motion.div
          className="hero-content"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="dot" />
            currently learning & building
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            This Is My{' '}
            <span className="gradient-text">First Website</span>
            <br />And I'm Proud Of It
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            Welcome to my corner of the internet! I'm a beginner developer who just built 
            their first website with React. This blog documents my journey from zero to here.
          </motion.p>

          <motion.div
            className="hero-cta-group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <MagneticButton className="btn-primary" onClick={() => document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' })}>
              Read My Blog ✨
            </MagneticButton>
            <MagneticButton className="btn-secondary" onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}>
              My Journey →
            </MagneticButton>
          </motion.div>
        </motion.div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div className="scroll-mouse" />
          <span>Scroll</span>
        </motion.div>
      </section>

      {/* ===== ABOUT ===== */}
      <AnimatedSection className="about-section" id="about">
        <div className="section-container">
          <motion.span className="section-label">About Me</motion.span>
          <motion.h2 className="section-title">
            A Beginner With Big Dreams 💭
          </motion.h2>
          <div className="about-grid">
            <div className="about-text">
              <p>
                <TextReveal text="Hey there! 👋 I'm a complete beginner in web development, and this is literally my first ever website. Yes, the one you're looking at right now!" />
              </p>
              <p>
                <TextReveal text="I started learning to code a few months ago, and what began as curiosity quickly turned into a passion. From my first 'Hello World' in HTML to building this animated React blog — it's been an incredible journey." />
              </p>
              <p>
                <TextReveal text="This blog is where I'll share everything I learn, the mistakes I make, and the small victories that keep me going. If you're also starting out, I hope my journey inspires you!" />
              </p>
            </div>

            <motion.div
              className="about-stats"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { number: 1, suffix: 'st', label: 'Website Built' },
                { number: 30, suffix: '+', label: 'Days of Learning' },
                { number: 500, suffix: '+', label: 'Lines of Code' },
                { number: 99, suffix: '%', label: 'Passion Level' }
              ].map((stat, i) => (
                <motion.div key={i} className="stat-card" variants={staggerItem}>
                  <div className="stat-number">
                    <AnimatedCounter target={stat.number} suffix={stat.suffix} />
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ===== BLOG ===== */}
      <AnimatedSection className="blog-section" id="blog">
        <div className="section-container">
          <motion.span className="section-label">Blog Posts</motion.span>
          <motion.h2 className="section-title">
            My Dev Diary 📝
          </motion.h2>

          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              className="featured-post"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{ y: -4 }}
            >
              <div className="featured-image-wrapper">
                <div style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  background: 'linear-gradient(135deg, #1a1030 0%, #0f0a1e 30%, #0a0515 60%, #150a20 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Animated code-like background */}
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.1,
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    color: 'var(--accent-violet)', padding: '20px',
                    lineHeight: 2, overflow: 'hidden', wordBreak: 'break-all'
                  }}>
                    {'<html><head><title>My First Website</title></head><body><h1>Hello World!</h1><p>I did it!</p><script>console.log("🎉")</script></body></html>'.repeat(20)}
                  </div>
                  <motion.div
                    style={{ fontSize: '6rem', position: 'relative', zIndex: 2 }}
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    🎉
                  </motion.div>
                </div>
              </div>
              <div className="featured-body">
                <div className="blog-card-tags">
                  {featuredPost.tags.map(tag => (
                    <span key={tag} className={`blog-tag ${tag}`}>{tag}</span>
                  ))}
                </div>
                <h3 className="blog-card-title">{featuredPost.title}</h3>
                <p className="blog-card-excerpt">{featuredPost.excerpt}</p>
                <div className="blog-card-footer">
                  <span className="blog-card-date">{featuredPost.date}</span>
                  <span className="blog-card-read">{featuredPost.readTime} read →</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Blog Grid */}
          <motion.div
            className="blog-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {regularPosts.map((post) => (
              <motion.article
                key={post.id}
                className="blog-card"
                variants={staggerItem}
                whileHover={{ y: -8 }}
                layout
              >
                <div className="blog-card-image-wrapper">
                  <div style={{
                    width: '100%',
                    height: '220px',
                    background: `linear-gradient(135deg, ${post.color}22 0%, ${post.color}08 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    position: 'relative'
                  }}>
                    <div className="overlay" />
                    <motion.span
                      style={{ position: 'relative', zIndex: 2 }}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: post.id * 0.3 }}
                    >
                      {post.id === 2 ? '⚛️' : post.id === 3 ? '🎨' : post.id === 4 ? '🟨' : post.id === 5 ? '💡' : '🧩'}
                    </motion.span>
                  </div>
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className={`blog-tag ${tag}`}>{tag}</span>
                    ))}
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <span className="blog-card-date">{post.date}</span>
                    <span className="blog-card-read">{post.readTime} read →</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ===== JOURNEY TIMELINE ===== */}
      <AnimatedSection className="timeline-section" id="journey">
        <div className="section-container">
          <motion.span className="section-label">My Journey</motion.span>
          <motion.h2 className="section-title">
            From Zero to Hero(ish) 🗺️
          </motion.h2>

          <div className="timeline">
            {timelineData.map((item, i) => (
              <motion.div
                key={i}
                className="timeline-item"
                initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.div
                  className="timeline-dot"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3, type: 'spring', stiffness: 300 }}
                />
                <div style={{ flex: 1 }} />
                <motion.div
                  className="timeline-content"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="timeline-date">{item.date}</div>
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-desc">{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== TECH STACK ===== */}
      <AnimatedSection className="tech-section" id="stack">
        <div className="section-container">
          <motion.span className="section-label">Tech Stack</motion.span>
          <motion.h2 className="section-title">
            Tools I'm Learning 🛠️
          </motion.h2>

          <motion.div
            className="tech-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                className="tech-card"
                variants={staggerItem}
                whileHover={{
                  y: -6,
                  rotate: [0, -1, 1, 0],
                  transition: { rotate: { duration: 0.4 } }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="tech-icon"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                >
                  {tech.icon}
                </motion.div>
                <div className="tech-name">{tech.name}</div>
                <div className="tech-level">{tech.level}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ===== CODE BLOCK SHOWCASE ===== */}
      <AnimatedSection className="about-section">
        <div className="section-container">
          <motion.span className="section-label">The Beginning</motion.span>
          <motion.h2 className="section-title">
            My Very First Code 👶
          </motion.h2>
          <motion.div
            className="code-block"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { parts: [{ text: '<!DOCTYPE ', cls: 'keyword' }, { text: 'html', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '<', cls: 'keyword' }, { text: 'html', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '  <', cls: 'keyword' }, { text: 'head', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '    <', cls: 'keyword' }, { text: 'title', cls: 'tag' }, { text: '>', cls: 'keyword' }, { text: 'My First Website', cls: 'string' }, { text: '</', cls: 'keyword' }, { text: 'title', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '  </', cls: 'keyword' }, { text: 'head', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '  <', cls: 'keyword' }, { text: 'body', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '    <', cls: 'keyword' }, { text: 'h1', cls: 'tag' }, { text: '>', cls: 'keyword' }, { text: 'Hello World! 🌍', cls: 'string' }, { text: '</', cls: 'keyword' }, { text: 'h1', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '    <', cls: 'keyword' }, { text: 'p', cls: 'tag' }, { text: '>', cls: 'keyword' }, { text: 'This is my first website!', cls: 'string' }, { text: '</', cls: 'keyword' }, { text: 'p', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '    // ', cls: 'comment' }, { text: 'I can\'t believe this works! 🎉', cls: 'comment' }] },
              { parts: [{ text: '  </', cls: 'keyword' }, { text: 'body', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
              { parts: [{ text: '</', cls: 'keyword' }, { text: 'html', cls: 'tag' }, { text: '>', cls: 'keyword' }] },
            ].map((line, i) => (
              <motion.div
                key={i}
                className="code-line"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                {line.parts.map((part, j) => (
                  <span key={j} className={part.cls}>{part.text}</span>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ===== NEWSLETTER ===== */}
      <AnimatedSection className="newsletter-section">
        <div className="section-container">
          <motion.div
            className="newsletter-card"
            whileHover={{ borderColor: 'rgba(139, 92, 246, 0.5)' }}
          >
            <h2>Follow My Journey ✉️</h2>
            <p>Get updates when I publish new blog posts about my coding adventures.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                className="newsletter-input"
                placeholder="your@email.com"
              />
              <MagneticButton className="btn-primary" onClick={() => {}}>
                Subscribe
              </MagneticButton>
            </form>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-content">
          <motion.div
            className="footer-logo"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            &lt;FirstOne /&gt;
          </motion.div>
          <p className="footer-text">
            A beginner's blog about web development. Built with curiosity and lots of coffee ☕
          </p>
          <ul className="footer-links">
            {['Home', 'About', 'Blog', 'Journey', 'Stack'].map(item => (
              <li key={item}><a href={`#${item.toLowerCase()}`}>{item}</a></li>
            ))}
          </ul>
          <div className="footer-bottom">
            <p>
              Made with <span className="footer-heart" style={{ display: 'inline-block' }}>❤️</span> by a beginner developer • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
