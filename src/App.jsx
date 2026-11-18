import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { TextPlugin } from 'gsap/TextPlugin'
import { Draggable } from 'gsap/Draggable'
import { useGSAP } from '@gsap/react'
import './App.css'

gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  ScrambleTextPlugin,
  TextPlugin,
  Draggable,
  useGSAP,
)

// Split setelah font siap, kalau tidak pembagian baris/karakter bisa salah ukur.
// Bikin context sendiri supaya revert tetap jalan walau telat dibuat.
function splitWhenReady(scope, build) {
  let ctx
  let dead = false
  document.fonts.ready.then(() => {
    if (!dead) ctx = gsap.context(build, scope)
  })
  return () => {
    dead = true
    ctx?.revert()
  }
}

function TimelineDemo() {
  const scope = useRef(null)
  const [run, setRun] = useState(0)

  useGSAP(
    () => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.tl-title', { y: 24, opacity: 0, duration: 0.5 })
        .from(
          '.tl-box',
          {
            y: 40,
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            stagger: 0.08,
            ease: 'back.out(1.7)',
          },
          '-=0.2',
        )
    },
    { scope, dependencies: [run], revertOnUpdate: true },
  )

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>Timeline + stagger</h2>
          <p>Urutan animasi, easing, repeater lewat state React.</p>
        </div>
        <button onClick={() => setRun((n) => n + 1)}>Replay</button>
      </header>
      <h3 className="tl-title">Timeline berjalan berurutan</h3>
      <div className="row">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="tl-box">
            {i + 1}
          </div>
        ))}
      </div>
    </section>
  )
}

function MagneticDemo() {
  const scope = useRef(null)

  useGSAP(
    () => {
      const btn = scope.current.querySelector('.magnet')
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' })
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' })

      const move = (e) => {
        const r = btn.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.4)
        yTo((e.clientY - r.top - r.height / 2) * 0.4)
      }
      const reset = () => {
        xTo(0)
        yTo(0)
      }

      btn.addEventListener('pointermove', move)
      btn.addEventListener('pointerleave', reset)
      return () => {
        btn.removeEventListener('pointermove', move)
        btn.removeEventListener('pointerleave', reset)
      }
    },
    { scope },
  )

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>Magnetic hover</h2>
          <p>gsap.quickTo untuk interaksi pointer tanpa re-render.</p>
        </div>
      </header>
      <button className="magnet">Tarik aku</button>
    </section>
  )
}

function ScrollDemo() {
  const scope = useRef(null)

  useGSAP(
    () => {
      gsap.utils.toArray('.reveal').forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%' },
        })
      })
    },
    { scope },
  )

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>ScrollTrigger: reveal</h2>
          <p>Elemen muncul saat masuk viewport.</p>
        </div>
      </header>
      <div className="stack">
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((name) => (
          <div key={name} className="reveal">
            {name}
          </div>
        ))}
      </div>
    </section>
  )
}

function HorizontalDemo() {
  const scope = useRef(null)

  useGSAP(
    () => {
      const viewport = scope.current.querySelector('.h-viewport')
      const track = scope.current.querySelector('.h-track')
      const dist = () => track.scrollWidth - viewport.clientWidth

      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: viewport,
          start: 'top top',
          end: () => '+=' + dist(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
    },
    { scope },
  )

  return (
    <section ref={scope} className="demo scroll-demo">
      <header className="demo-head">
        <div>
          <h2>ScrollTrigger: horizontal pin</h2>
          <p>Section dipin; track bergerak horizontal mengikuti scroll.</p>
        </div>
      </header>
      <div className="h-viewport">
        <div className="h-track">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-panel">
              <span>0{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ParallaxDemo() {
  const scope = useRef(null)

  useGSAP(
    () => {
      scope.current.querySelectorAll('.p-layer').forEach((layer, i) => {
        gsap.fromTo(
          layer,
          { yPercent: 30 + i * 25 },
          {
            yPercent: -30 - i * 25,
            ease: 'none',
            scrollTrigger: {
              trigger: '.p-stage',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })
    },
    { scope },
  )

  return (
    <section ref={scope} className="demo scroll-demo">
      <header className="demo-head">
        <div>
          <h2>ScrollTrigger: parallax scrub</h2>
          <p>Layer bergerak beda kecepatan, terikat posisi scroll.</p>
        </div>
      </header>
      <div className="p-stage">
        <div className="p-layer p-1" />
        <div className="p-layer p-2" />
        <div className="p-layer p-3" />
        <div className="p-caption">scroll</div>
      </div>
    </section>
  )
}

function StackDemo() {
  const scope = useRef(null)

  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.s-card')
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: next,
            start: 'top bottom',
            end: 'top top+=64',
            scrub: true,
          },
        })
      })
    },
    { scope },
  )

  return (
    <section ref={scope} className="demo scroll-demo">
      <header className="demo-head">
        <div>
          <h2>ScrollTrigger: stacking cards</h2>
          <p>Kartu sticky menumpuk, kartu di bawahnya mengecil.</p>
        </div>
      </header>
      <div className="s-stack">
        {['Satu', 'Dua', 'Tiga', 'Empat'].map((t) => (
          <div key={t} className="s-card">
            {t}
          </div>
        ))}
      </div>
    </section>
  )
}

function SplitLinesDemo() {
  const scope = useRef(null)
  const title = useRef(null)

  useGSAP(
    () =>
      splitWhenReady(scope.current, () => {
        const split = SplitText.create(title.current, {
          type: 'lines',
          mask: 'lines',
        })

        gsap.from(split.lines, {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: title.current, start: 'top 85%' },
        })
      }),
    { scope },
  )

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>SplitText: mask reveal</h2>
          <p>
            <code>mask: 'lines'</code> — tiap baris dibungkus overflow hidden, teks
            naik dari bawah.
          </p>
        </div>
      </header>
      <h3 ref={title} className="split-display">
        Animasi teks yang tidak sekadar fade in, tapi muncul baris per baris.
      </h3>
    </section>
  )
}

function SplitWaveDemo() {
  const scope = useRef(null)
  const title = useRef(null)
  const splitRef = useRef(null)

  useGSAP(() => {
    const cleanup = splitWhenReady(scope.current, () => {
      splitRef.current = SplitText.create(title.current, { type: 'chars' })
    })
    return () => {
      splitRef.current = null
      cleanup()
    }
  }, { scope })

  const wave = () => {
    if (!splitRef.current) return
    gsap.to(splitRef.current.chars, {
      y: -16,
      duration: 0.35,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      stagger: { each: 0.025, from: 'start' },
      overwrite: true,
    })
  }

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>SplitText: char wave</h2>
          <p>Arahkan pointer ke teks, atau tekan tombol.</p>
        </div>
        <button onClick={wave}>Wave</button>
      </header>
      <h3
        ref={title}
        className="split-display wave"
        onPointerEnter={wave}
      >
        Tiap huruf punya ritme sendiri
      </h3>
    </section>
  )
}

function SplitFillDemo() {
  const scope = useRef(null)
  const title = useRef(null)

  useGSAP(
    () =>
      splitWhenReady(scope.current, () => {
        const split = SplitText.create(title.current, { type: 'chars' })

        gsap.fromTo(
          split.chars,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.04,
            ease: 'none',
            scrollTrigger: {
              trigger: title.current,
              start: 'top 80%',
              end: 'bottom 45%',
              scrub: true,
            },
          },
        )
      }),
    { scope },
  )

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>SplitText: scroll fill</h2>
          <p>Opacity per karakter di-scrub posisi scroll.</p>
        </div>
      </header>
      <h3 ref={title} className="split-display">
        Teks ini menyala karakter demi karakter selama halaman digulir.
      </h3>
    </section>
  )
}

function ScrambleDemo() {
  const scope = useRef(null)
  const title = useRef(null)

  useGSAP(
    () =>
      splitWhenReady(scope.current, () => {
        const split = SplitText.create(title.current, { type: 'words' })
        const originals = split.words.map((w) => w.textContent)

        gsap.set(split.words, {
          text: (i) => '█'.repeat(originals[i].length),
        })

        split.words.forEach((word, i) => {
          gsap.to(word, {
            duration: 1,
            delay: i * 0.12,
            scrambleText: {
              text: originals[i],
              chars: '!<>-_\\/[]{}=+*^?#',
              speed: 0.5,
              revealDelay: 0.15,
            },
            scrollTrigger: { trigger: title.current, start: 'top 85%', once: true },
          })
        })
      }),
    { scope },
  )

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>SplitText + ScrambleText</h2>
          <p>Per kata dipecah dulu, lalu di-decode acak saat masuk viewport.</p>
        </div>
      </header>
      <h3 ref={title} className="split-display">
        Decoding text in real time
      </h3>
    </section>
  )
}

function DragDemo() {
  const scope = useRef(null)

  useGSAP(
    () => {
      const instances = Draggable.create('.chip', {
        bounds: '.track',
        edgeResistance: 0.8,
      })
      return () => instances.forEach((d) => d.kill())
    },
    { scope },
  )

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>Draggable</h2>
          <p>Geser chip di dalam track, dibatasi bounds.</p>
        </div>
      </header>
      <div className="track">
        <div className="chip">drag</div>
      </div>
    </section>
  )
}

function SetterDemo() {
  const scope = useRef(null)
  const [bench, setBench] = useState(null)

  useGSAP(
    () => {
      const [stageA, stageB] = scope.current.querySelectorAll('.stage')
      const a = scope.current.querySelector('.dot-a')
      const b = scope.current.querySelector('.dot-b')
      const setBx = gsap.quickSetter(b, 'x', 'px')
      const setBy = gsap.quickSetter(b, 'y', 'px')

      const follow = (stage, apply) => {
        const move = (e) => {
          const r = stage.getBoundingClientRect()
          apply(
            Math.min(Math.max(e.clientX - r.left - 14, 0), r.width - 28),
            Math.min(Math.max(e.clientY - r.top - 14, 0), r.height - 28),
          )
        }
        stage.addEventListener('pointermove', move)
        return () => stage.removeEventListener('pointermove', move)
      }

      const offA = follow(stageA, (x, y) => gsap.set(a, { x, y }))
      const offB = follow(stageB, (x, y) => {
        setBx(x) // closure siap pakai, skip parsing
        setBy(y)
      })

      return () => {
        offA()
        offB()
      }
    },
    { scope },
  )

  const runBench = () => {
    const a = scope.current.querySelector('.dot-a')
    const b = scope.current.querySelector('.dot-b')
    const setBx = gsap.quickSetter(b, 'x', 'px')
    const N = 20000

    let t = performance.now()
    for (let i = 0; i < N; i++) gsap.set(a, { x: i % 200 })
    const setMs = performance.now() - t

    t = performance.now()
    for (let i = 0; i < N; i++) setBx(i % 200)
    const quickMs = performance.now() - t

    setBench({ setMs, quickMs })
  }

  return (
    <section ref={scope} className="demo">
      <header className="demo-head">
        <div>
          <h2>gsap.set vs quickSetter</h2>
          <p>
            Titik A pakai <code>gsap.set</code>, titik B pakai{' '}
            <code>quickSetter</code>. Gerakkan pointer di kotak.
          </p>
        </div>
        <button onClick={runBench}>Benchmark 20k</button>
      </header>

      <div className="stages">
        <div className="stage">
          <span className="stage-tag">gsap.set</span>
          <span className="dot dot-a" />
        </div>
        <div className="stage">
          <span className="stage-tag">quickSetter</span>
          <span className="dot dot-b" />
        </div>
      </div>

      <ul className="notes">
        <li>
          <code>set(el, vars)</code> — bikin tween instan tiap panggil, boleh banyak
          properti, unit otomatis.
        </li>
        <li>
          <code>quickSetter(el, prop, unit)</code> — closure mentah, satu properti, tulis
          unit eksplisit biar paling cepat, tanpa parsing objek.
        </li>
      </ul>

      {bench && (
        <p className="bench">
          20.000 panggilan — set: {bench.setMs.toFixed(1)}ms | quickSetter:{' '}
          {bench.quickMs.toFixed(1)}ms
        </p>
      )}
    </section>
  )
}

const TABS = {
  core: {
    label: 'Core',
    demos: [TimelineDemo, MagneticDemo, SetterDemo],
  },
  scroll: {
    label: 'ScrollTrigger',
    demos: [ScrollDemo, HorizontalDemo, ParallaxDemo, StackDemo],
  },
  split: {
    label: 'SplitText',
    demos: [SplitLinesDemo, SplitWaveDemo, SplitFillDemo, ScrambleDemo],
  },
  plugins: {
    label: 'Plugin lain',
    demos: [DragDemo],
  },
}

export default function App() {
  const [tab, setTab] = useState('core')

  const select = (id) => {
    setTab(id)
    window.scrollTo(0, 0)
  }

  return (
    <main>
      <h1 className="page-title">React + GSAP playground</h1>
      <p className="page-sub">Edit src/App.jsx, simpan, lihat hasilnya.</p>

      <nav className="tabs" role="tablist">
        {Object.entries(TABS).map(([id, { label }]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => select(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div role="tabpanel">
        {TABS[tab].demos.map((Demo, i) => (
          <Demo key={i} />
        ))}
      </div>

      <footer>Docs: gsap.com/docs | useGSAP: gsap.com/resources/React</footer>
    </main>
  )
}
