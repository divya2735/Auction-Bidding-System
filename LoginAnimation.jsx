import { useState, useEffect } from 'react';

export default function LoginAnimation({ 
  brandName = "LuxeBid",
  onComplete = null,
  animationDuration = 4500
}) {
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationDone(true);
      if (onComplete) {
        onComplete();
      }
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [animationDuration, onComplete]);

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Main animated container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Rotating and expanding square with hammer */}
        <div
          className="relative"
          style={{
            animation: `rotateAndExpand 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
          }}
        >
          {/* Black square with hammer */}
          <div
            className="w-48 h-48 rounded-3xl bg-black flex items-center justify-center flex-shrink-0"
            style={{
              animation: `rotateSquare 2s ease-out forwards`
            }}
          >
            {/* Hammer icon */}
            <svg
              className="w-20 h-20 text-white"
              style={{
                animation: `fadeOutIcon 1s ease-out 0.5s forwards`
              }}
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 3H8C6.9 3 6 3.9 6 5V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V5C18 3.9 17.1 3 16 3ZM9 15H7V13H9V15ZM9 11H7V9H9V11ZM13 15H11V13H13V15ZM13 11H11V9H13V11ZM17 15H15V13H17V15ZM17 11H15V9H17V11Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Black overlay text - fades in after square expands */}
      <div
        className="absolute inset-0 bg-black flex flex-col items-center justify-center"
        style={{
          animation: `fadeInText 1.2s ease-out 3.2s forwards`,
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        <div className="text-center px-8">
          <p 
            className="text-white text-lg tracking-[0.2em] mb-6 font-light"
            style={{
              animation: `slideUpText 1s ease-out 3.2s forwards`,
              opacity: 0,
              transform: 'translateY(20px)'
            }}
          >
            WELCOME INTO
          </p>
          <h1 
            className="text-white text-8xl font-serif font-bold"
            style={{
              animation: `slideUpText 1s ease-out 3.5s forwards`,
              opacity: 0,
              transform: 'translateY(20px)',
              letterSpacing: '0.05em'
            }}
          >
            {brandName}
          </h1>
        </div>
      </div>

      <style>{`
        @keyframes rotateSquare {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(45deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes rotateAndExpand {
          0% {
            transform: scale(1);
          }
          60% {
            transform: scale(1);
          }
          100% {
            transform: scale(15);
          }
        }

        @keyframes fadeOutIcon {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes fadeInText {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes slideUpText {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}