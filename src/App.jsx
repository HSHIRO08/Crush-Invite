import { useRef, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { Heart, Sparkles, Clock, MapPin, Utensils, Check, Download, Share2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Static data & content                                              */
/* ------------------------------------------------------------------ */

const TEASE_MESSAGES = [
  '',
  'Ơ, định trốn đi đâu thế? 😆',
  'Nhanh tay lên nào, gần bắt được rồi~',
  'Em chắc chưa đó? 🥺',
  'Hông Yes thì chạy mệt lắm á 😅',
  'Cố thêm 1 lần nữa coi nè 😏',
];

const DURATIONS = [
  { id: 'short', label: 'Vài buổi thui' },
  { id: 'full', label: 'Đi cả ngày lun!' },
];

const PLACES = [
  { id: 'vmqtg', label: 'WorkShop nào đó ở HN' },
  { id: 'btha', label: 'Bảo tàng Hà Nội' },
  { id: 'btls', label: 'Bảo tàng Lịch sử Quân sự Việt Nam' },
  { id: 'ntht', label: 'Nhà tù Hỏa Lò' },
  { id: 'aeon-mall', label: 'Aeon Mall' },
  { id: 'shopping-mall', label: 'Mua đồ ở trung tâm thương mại' },
  { id: 'cinema', label: 'Xem phim' },
];

const FOODS = [
  { id: 'wet', label: 'Đồ nước (Phở, bún...)' },
  { id: 'dry', label: 'Đồ khô (Nướng, cơm...)' },
  { id: 'half', label: 'Nửa này nửa kia' },
];

const HEART_COLORS = ['text-pink-300', 'text-pink-400', 'text-rose-300', 'text-fuchsia-300'];

const TIME_OF_DAY = [
  { id: 'morning', label: 'Buổi sáng ☀️' },
  { id: 'afternoon', label: 'Buổi chiều 🌤️' },
];

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function FloatingHearts({ count, intense }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const variation = (offset) => ((i * 37 + count * 17 + offset * 23) % 100) / 100;
        return {
          id: i,
          left: variation(1) * 100,
          delay: variation(2) * 8,
          duration: 6 + variation(3) * 6,
          size: 14 + variation(4) * 18,
          color: HEART_COLORS[Math.floor(variation(5) * HEART_COLORS.length)],
        };
      }),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {hearts.map((h) => (
        <Heart
          key={h.id}
          fill="currentColor"
          className={`floating-heart absolute ${h.color} ${intense ? 'opacity-70' : 'opacity-40'}`}
          style={{
            left: `${h.left}%`,
            bottom: '-40px',
            width: h.size,
            height: h.size,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function ProgressDots({ step }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-2.5 rounded-full transition-all duration-500 ${
            n === step ? 'w-8 bg-pink-500' : n < step ? 'w-2.5 bg-pink-300' : 'w-2.5 bg-pink-100'
          }`}
        />
      ))}
    </div>
  );
}

function ToggleChip({ active, onClick, children, multi }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:text-base ${
        active
          ? 'scale-[1.02] border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-200'
          : 'border-pink-200 bg-white text-pink-700 hover:border-pink-300 hover:bg-pink-50'
      }`}
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${
          multi ? 'rounded-md' : 'rounded-full'
        } ${active ? 'border-white' : 'border-pink-300'}`}
      >
        {active && <Check size={13} strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function CrushDateInvite() {
  const [step, setStep] = useState(1);
  const [yesClicked, setYesClicked] = useState(false);

  // ---- Step 1: chase-the-No-button logic ----
  const [noCount, setNoCount] = useState(0);
  const [noVisible, setNoVisible] = useState(true);
  const [noPos, setNoPos] = useState({ top: 50, left: 66 });
  const noScale = Math.max(0.35, 1 - noCount * 0.12);

  const dodgeNo = () => {
    const next = noCount + 1;
    setNoCount(next);
    if (next >= 6) {
      setNoVisible(false);
    } else {
      setNoPos({
        top: 10 + Math.random() * 70,
        left: 8 + Math.random() * 80,
      });
    }
  };

  // ---- Step 2: schedule form state ----
  const [duration, setDuration] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState(null);
  const [places, setPlaces] = useState([]);
  const [food, setFood] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);
  const cardRef = useRef(null);

  const togglePlace = (id) =>
    setPlaces((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const canSubmit = Boolean(duration && food && (duration === 'full' || (duration === 'short' && timeOfDay)));
  const durationLabel = DURATIONS.find((d) => d.id === duration)?.label;
  const timeOfDayLabel = TIME_OF_DAY.find((t) => t.id === timeOfDay)?.label;
  const foodLabel = FOODS.find((f) => f.id === food)?.label;
  const placeLabels = PLACES.filter((p) => places.includes(p.id)).map((p) => p.label);

  const handleSubmit = () => {
    setStep(3);
  };

  const createInviteImage = async () => {
    if (!cardRef.current) {
      throw new Error('Không tìm thấy thiệp lịch hẹn để chụp.');
    }

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));

    return html2canvas(cardRef.current, {
      backgroundColor: '#fff7fb',
      scale: Math.min(window.devicePixelRatio || 1, 1.5),
      useCORS: false,
      allowTaint: false,
      logging: false,
    });
  };

  const canvasToBlob = (canvas) =>
    new Promise((resolve, reject) => {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error('Không thể chuyển thiệp thành file ảnh.'));
        }, 'image/png');
        return;
      }

      try {
        const dataUrl = canvas.toDataURL('image/png');
        const byteString = atob(dataUrl.split(',')[1]);
        const bytes = Uint8Array.from(byteString, (character) => character.charCodeAt(0));
        resolve(new Blob([bytes], { type: 'image/png' }));
      } catch (error) {
        reject(error);
      }
    });

  const downloadInvite = async () => {
    try {
      setShareStatus('capturing');
      const canvas = await createInviteImage();
      const imageUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'lich-hen-cua-hai-dua.png';
      link.href = imageUrl;
      link.rel = 'noopener';
      link.click();
      setShareStatus('downloaded');
    } catch (error) {
      console.error('Không thể tạo ảnh lịch hẹn:', error);
      setShareStatus('error');
    }
  };

  const shareInvite = async () => {
    try {
      setShareStatus('capturing');
      const canvas = await createInviteImage();
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'lich-hen-cua-hai-dua.png', { type: 'image/png' });
      const canShareFile =
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }));

      if (canShareFile) {
        await navigator.share({
          title: 'Lịch hẹn của hai đứa mình 💖',
          text: 'Lịch hẹn của hai đứa mình nè 💌',
          files: [file],
        });
        setShareStatus('shared');
      } else {
        await downloadInvite();
        setShareStatus('fallback');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Không thể chia sẻ lịch hẹn:', error);
        setShareStatus('error');
      } else {
        setShareStatus(null);
      }
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-4 sm:p-6"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(25deg); opacity: 0; }
        }
        .floating-heart {
          animation-name: floatUp;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }

        @keyframes shimmerMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .shimmer-text {
          background-size: 200% auto;
          animation: shimmerMove 3s linear infinite;
        }

        @keyframes popIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pop-in { animation: popIn 0.45s ease-out both; }

        @keyframes expandToCenter {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
          100% { transform: translate(-50%, -50%) scale(1.8); left: 50% !important; top: 50% !important; }
        }
        .expand-to-center {
          animation: expandToCenter 0.8s ease-in-out forwards;
        }

        @keyframes noButtonDisappear {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.1) rotate(360deg); pointer-events: none; }
        }
        .no-button-disappear {
          animation: noButtonDisappear 0.8s ease-in-out forwards;
        }
      `}</style>

      <FloatingHearts count={step === 3 ? 26 : 14} intense={step === 3} />

      <div className="pop-in relative z-10 w-full rounded-3xl border border-pink-100 bg-white bg-opacity-90 p-6 shadow-xl shadow-pink-200 backdrop-blur-sm sm:p-10">
        <ProgressDots step={step} />

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <div className="text-center">
            <Sparkles className="mx-auto mb-4 text-pink-400" size={32} />
            <h1
              className="mb-2 text-2xl font-bold leading-snug text-pink-600 sm:text-3xl md:text-4xl"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              Anh thực sự muốn dành 1 ngày đẹp để đi chơi với em.
            </h1>
            <p
              className="mb-10 text-xl font-semibold text-rose-500 sm:text-2xl md:text-3xl"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              Vậy ý em thế nào? 🥹
            </p>

            <div className="relative mb-3 h-56 w-full sm:h-64">
              <button
                type="button"
                onClick={() => {
                  setYesClicked(true);
                  setTimeout(() => setStep(2), 800);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-pink-300 transition-transform duration-200 hover:scale-110 active:scale-95 sm:px-8 sm:py-4 sm:text-lg ${
                  yesClicked ? 'expand-to-center' : ''
                }`}
                style={{ top: '50%', left: '36%', fontFamily: "'Baloo 2', sans-serif" }}
              >
                Dạ điiiii! 🥰
              </button>

              {noVisible && (
                <button
                  type="button"
                  onMouseEnter={dodgeNo}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    dodgeNo();
                  }}
                  className={`absolute rounded-full border-2 border-pink-300 bg-white px-5 py-2.5 text-sm font-semibold text-pink-400 shadow transition-all duration-300 ease-out sm:px-6 sm:py-3 sm:text-base ${
                    yesClicked ? 'no-button-disappear' : ''
                  }`}
                  style={{
                    top: `${noPos.top}%`,
                    left: `${noPos.left}%`,
                    transform: `translate(-50%, -50%) scale(${noScale})`,
                    fontFamily: "'Baloo 2', sans-serif",
                  }}
                >
                  Không 😢
                </button>
              )}
            </div>

            <p className="h-5 text-sm italic text-rose-400">
              {noVisible ? TEASE_MESSAGES[noCount] : 'Thôi nha, chỉ còn nút Yes thôi đó nha! 💗'}
            </p>
          </div>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <div>
            <h2
              className="mb-8 text-center text-2xl font-bold text-pink-600 sm:text-3xl"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              Thiết kế ngày hẹn hò (29/06/2024) của hai đứa mình nha! 💖
            </h2>

            <section className="mb-7">
              <div className="mb-3 flex items-center gap-2 font-semibold text-pink-700">
                <Clock size={18} /> Thời gian
              </div>
              <div className="flex flex-wrap gap-3">
                {DURATIONS.map((d) => (
                  <ToggleChip 
                    key={d.id} 
                    active={duration === d.id} 
                    onClick={() => {
                      setDuration(d.id);
                      if (d.id !== 'short') {
                        setTimeOfDay(null);
                      }
                    }}
                  >
                    {d.label}
                  </ToggleChip>
                ))}
              </div>

              {duration === 'short' && (
                <div className="mt-4 ml-2 border-l-2 border-pink-300 pl-4">
                  <p className="mb-2 text-sm font-medium text-pink-600">Chọn buổi nào?</p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_OF_DAY.map((t) => (
                      <ToggleChip 
                        key={t.id} 
                        active={timeOfDay === t.id} 
                        onClick={() => setTimeOfDay(t.id)}
                      >
                        {t.label}
                      </ToggleChip>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="mb-7">
              <div className="mb-3 flex items-center gap-2 font-semibold text-pink-700">
                <MapPin size={18} /> Địa điểm ghé thăm
              </div>
              <div className="flex flex-wrap gap-3">
                {PLACES.map((p) => (
                  <ToggleChip key={p.id} multi active={places.includes(p.id)} onClick={() => togglePlace(p.id)}>
                    {p.label}
                  </ToggleChip>
                ))}
              </div>
            </section>

            <section className="mb-3">
              <div className="mb-3 flex items-center gap-2 font-semibold text-pink-700">
                <Utensils size={18} /> Gu ăn uống (Trưa/Tối)
              </div>
              <div className="flex flex-wrap gap-3">
                {FOODS.map((f) => (
                  <ToggleChip key={f.id} active={food === f.id} onClick={() => setFood(f.id)}>
                    {f.label}
                  </ToggleChip>
                ))}
              </div>
              <p className="mt-3 text-right text-xs italic text-rose-400 sm:text-sm">
                *Quán cafe gần nhất cứ để tớ lo hết nhé! 😉*
              </p>
            </section>

            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className={`w-full rounded-full px-8 py-3 text-base font-bold shadow-lg transition-all duration-200 sm:w-auto sm:text-lg ${
                  canSubmit
                    ? 'bg-pink-500 text-white shadow-pink-300 hover:scale-105 active:scale-95'
                    : 'cursor-not-allowed bg-pink-100 text-pink-300'
                }`}
                style={{ fontFamily: "'Baloo 2', sans-serif" }}
              >
                Chốt lịch nha! 🚀
              </button>
              {!canSubmit && (
                <p className="text-xs text-rose-400">
                  {!duration || !food 
                    ? 'Chọn thời gian và gu ăn uống giúp anh nha 😊' 
                    : duration === 'short' && !timeOfDay 
                    ? 'Chọn buổi sáng hay chiều giúp anh nha 😊'
                    : 'Điền đầy đủ thông tin nha 😊'}
                </p>
              )}
              {canSubmit && (
                <p className="text-center text-xs text-rose-400">
                  Sau khi bấm, anh sẽ có một tấm thiệp lịch hẹn thật xinh 💌
                </p>
              )}
            </div>
          </div>
        )}

        {/* ---------------- STEP 3 ---------------- */}
        {step === 3 && (
          <div className="text-center">
            <Heart className="mx-auto mb-3 text-pink-500" size={36} fill="currentColor" />
            <h2
              className="mb-1 text-2xl font-bold text-pink-600 sm:text-3xl"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              Yeahhh, chốt đơn thành công! 🎉
            </h2>
            <p className="mb-6 text-rose-400">Lịch hẹn của hai đứa mình đây nè~</p>
            <div
              ref={cardRef}
              className="mx-auto max-w-md rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-white via-pink-50 to-rose-100 p-6 text-left shadow-lg shadow-pink-100"
            >
              <div className="mb-5 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">Our date plan</p>
                <p className="mt-2 text-2xl font-extrabold text-pink-600" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  Lịch hẹn của hai đứa mình 💖
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-pink-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-pink-400">Thời gian</p>
                    <p className="font-semibold text-rose-600">
                      {durationLabel}
                      {timeOfDayLabel && ` - ${timeOfDayLabel}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-pink-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-pink-400">Điểm đến</p>
                    <p className="font-semibold text-rose-600">
                      {placeLabels.length ? placeLabels.join(', ') : 'Cứ để anh dẫn đi đại nha 😆'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Utensils size={18} className="mt-0.5 shrink-0 text-pink-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-pink-400">Gu ăn uống</p>
                    <p className="font-semibold text-rose-600">{foodLabel}</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center font-bold text-pink-500" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                Hẹn gặp em vào ngày mai nhé hihi 🌸
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={shareInvite}
                disabled={shareStatus === 'capturing'}
                className="flex items-center gap-2 rounded-full bg-pink-500 px-5 py-3 font-bold text-white shadow-lg shadow-pink-200 transition hover:scale-105 disabled:cursor-wait disabled:opacity-60"
              >
                <Share2 size={18} /> Chia sẻ thiệp
              </button>
              <button
                type="button"
                onClick={downloadInvite}
                disabled={shareStatus === 'capturing'}
                className="flex items-center gap-2 rounded-full border-2 border-pink-300 bg-white px-5 py-3 font-bold text-pink-600 transition hover:scale-105 disabled:cursor-wait disabled:opacity-60"
              >
                <Download size={18} /> Tải ảnh xuống
              </button>
            </div>
            <p className="mt-3 min-h-5 text-sm text-pink-500">
              {shareStatus === 'capturing' && 'Đang tạo tấm thiệp xinh cho mình... ✨'}
              {shareStatus === 'shared' && 'Đã mở bảng chia sẻ rồi đó 💌'}
              {shareStatus === 'downloaded' && 'Đã tải thiệp xuống, giờ gửi đi mọi nền tảng nha 💌'}
              {shareStatus === 'fallback' && 'Thiết bị chưa hỗ trợ chia sẻ trực tiếp, ảnh đã được tải xuống 💌'}
              {shareStatus === 'error' && 'Chưa tạo được ảnh. Bạn thử lại giúp mình nha 🥺'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
