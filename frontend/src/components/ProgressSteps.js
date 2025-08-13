"use client"

export default function ProgressSteps({ currentStep, completedSteps = [] }) {
  // Helper function to determine if step is completed
  const isCompleted = (stepNumber) => completedSteps.includes(stepNumber)
  
  return (
    <div className="flex items-center bg-blue-100/70 rounded-full px-2 py-0 shadow-sm relative z-0 mt-8">
      <div className="w-full">
        <div className="flex items-center justify-between gap-2">
          
          {/* Step 1 - Appointment Type */}
          <div className="flex items-center">
            <div 
                className={`
                flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${currentStep === 1 || isCompleted(1)
                    ? 'bg-transparent border hover:border-blue-300' 
                    : 'bg-transparent'
                }
                `}
                style={currentStep === 1 || isCompleted(1) ? {
                background: 'transparent',
                borderColor: '#0575E6',
                } : {
                background: 'transparent',
                borderColor: '#0575E6',
                }}
            >
                <div
                className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2
                    ${currentStep === 1 || isCompleted(1) ? 'text-white' : 'border'}
                `}
                style={
                    currentStep === 1 || isCompleted(1)
                    ? { 
                        background: 'linear-gradient(135deg, #0575E6, #021B79)',
                        }
                    : { 
                        background: 'transparent',
                        borderColor: '#0575E6',
                        borderWidth: '2px',
                        color: '#0575E6',
                        }
                }
                >
                {isCompleted(1) ? '✓' : 1}
                </div>
                <span 
                className="whitespace-nowrap"
                style={{
                    background: 'linear-gradient(135deg, #0575E6, #021B79)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
                >
                Appointment Type
                </span>
            </div>
            <div className="w-8 h-px mx-2"></div>
        </div>

          {/* Step 2 - Privacy & Consent */}
          <div className="flex items-center">
            <div 
                className={`
                flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${currentStep === 2 || isCompleted(2)
                    ? 'bg-transparent border hover:border-blue-300' 
                    : 'bg-transparent'
                }
                `}
                style={currentStep === 2 || isCompleted(2) ? {
                background: 'transparent',
                borderColor: '#0575E6',
                } : {
                background: 'transparent',
                borderColor: '#0575E6',
                }}
            >
                <div
                className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2
                    ${currentStep === 2 || isCompleted(2) ? 'text-white' : 'border'}
                `}
                style={
                    currentStep === 2 || isCompleted(2)
                    ? { 
                        background: 'linear-gradient(135deg, #0575E6, #021B79)',
                        }
                    : { 
                        background: 'transparent',
                        borderColor: '#0575E6',
                        borderWidth: '2px',
                        color: '#0575E6',
                        }
                }
                >
                {isCompleted(2) ? '✓' : 2}
                </div>
                <span 
                className="whitespace-nowrap"
                style={{
                    background: 'linear-gradient(135deg, #0575E6, #021B79)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
                >
                Privacy & Consent
                </span>
            </div>
            <div className="w-8 h-px mx-2"></div>
        </div>

        {/* Step 3 - Account Setup */}
          <div className="flex items-center">
            <div 
                className={`
                flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${currentStep === 3 || isCompleted(3)
                    ? 'bg-transparent border hover:border-blue-300' 
                    : 'bg-transparent'
                }
                `}
                style={currentStep === 3 || isCompleted(3) ? {
                background: 'transparent',
                borderColor: '#0575E6',
                } : {
                background: 'transparent',
                borderColor: '#0575E6',
                }}
            >
                <div
                className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2
                    ${currentStep === 3 || isCompleted(3) ? 'text-white' : 'border'}
                `}
                style={
                    currentStep === 3 || isCompleted(3)
                    ? { 
                        background: 'linear-gradient(135deg, #0575E6, #021B79)',
                        }
                    : { 
                        background: 'transparent',
                        borderColor: '#0575E6',
                        borderWidth: '2px',
                        color: '#0575E6',
                        }
                }
                >
                {isCompleted(3) ? '✓' : 3}
                </div>
                <span 
                className="whitespace-nowrap"
                style={{
                    background: 'linear-gradient(135deg, #0575E6, #021B79)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
                >
                Account Setup
                </span>
            </div>
            <div className="w-8 h-px mx-2"></div>
        </div>

          {/* Step 4 - Personal Details */}
          <div className="flex items-center">
            <div 
                className={`
                flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${currentStep === 4 || isCompleted(4)
                    ? 'bg-transparent border hover:border-blue-300' 
                    : 'bg-transparent'
                }
                `}
                style={currentStep === 4 || isCompleted(4) ? {
                background: 'transparent',
                borderColor: '#0575E6',
                } : {
                background: 'transparent',
                borderColor: '#0575E6',
                }}
            >
                <div
                className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2
                    ${currentStep === 4 || isCompleted(4) ? 'text-white' : 'border'}
                `}
                style={
                    currentStep === 4 || isCompleted(4)
                    ? { 
                        background: 'linear-gradient(135deg, #0575E6, #021B79)',
                        }
                    : { 
                        background: 'transparent',
                        borderColor: '#0575E6',
                        borderWidth: '2px',
                        color: '#0575E6',
                        }
                }
                >
                {isCompleted(4) ? '✓' : 4}
                </div>
                <span 
                className="whitespace-nowrap"
                style={{
                    background: 'linear-gradient(135deg, #0575E6, #021B79)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
                >
                Personal Details
                </span>
            </div>
            <div className="w-8 h-px mx-2"></div>
        </div>

          {/* Step 5 - Medical Details */}
          <div className="flex items-center">
            <div 
                className={`
                flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${currentStep === 5 || isCompleted(5)
                    ? 'bg-transparent border hover:border-blue-300' 
                    : 'bg-transparent'
                }
                `}
                style={currentStep === 5 || isCompleted(5) ? {
                background: 'transparent',
                borderColor: '#0575E6',
                } : {
                background: 'transparent',
                borderColor: '#0575E6',
                }}
            >
                <div
                className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2
                    ${currentStep === 5 || isCompleted(5) ? 'text-white' : 'border'}
                `}
                style={
                    currentStep === 5 || isCompleted(5)
                    ? { 
                        background: 'linear-gradient(135deg, #0575E6, #021B79)',
                        }
                    : { 
                        background: 'transparent',
                        borderColor: '#0575E6',
                        borderWidth: '2px',
                        color: '#0575E6',
                        }
                }
                >
                {isCompleted(5) ? '✓' : 5}
                </div>
                <span 
                className="whitespace-nowrap"
                style={{
                    background: 'linear-gradient(135deg, #0575E6, #021B79)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
                >
                Medical Details
                </span>
            </div>
            <div className="w-8 h-px mx-2"></div>
        </div>

          {/* Step 6 - Referral Details */}
          <div className="flex items-center">
            <div 
                className={`
                flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${currentStep === 6 || isCompleted(6)
                    ? 'bg-transparent border hover:border-blue-300' 
                    : 'bg-transparent'
                }
                `}
                style={currentStep === 6 || isCompleted(6) ? {
                background: 'transparent',
                borderColor: '#0575E6',
                } : {
                background: 'transparent',
                borderColor: '#0575E6',
                }}
            >
                <div
                className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2
                    ${currentStep === 6 || isCompleted(6) ? 'text-white' : 'border'}
                `}
                style={
                    currentStep === 6 || isCompleted(6)
                    ? { 
                        background: 'linear-gradient(135deg, #0575E6, #021B79)',
                        }
                    : { 
                        background: 'transparent',
                        borderColor: '#0575E6',
                        borderWidth: '2px',
                        color: '#0575E6',
                        }
                }
                >
                {isCompleted(6) ? '✓' : 6}
                </div>
                <span 
                className="whitespace-nowrap"
                style={{
                    background: 'linear-gradient(135deg, #0575E6, #021B79)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
                >
                Referral Details
                </span>
            </div>
            <div className="w-8 h-px mx-2"></div>
        </div>

          {/* Step 7 - Review & Submit */}
          <div className="flex items-center">
            <div 
                className={`
                flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${currentStep === 7 || isCompleted(7)
                    ? 'bg-transparent border hover:border-blue-300' 
                    : 'bg-transparent'
                }
                `}
                style={currentStep === 7 || isCompleted(7) ? {
                background: 'transparent',
                borderColor: '#0575E6',
                } : {
                background: 'transparent',
                borderColor: '#0575E6',
                }}
            >
                <div
                className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2
                    ${currentStep === 7 || isCompleted(7) ? 'text-white' : 'border'}
                `}
                style={
                    currentStep === 7 || isCompleted(7)
                    ? { 
                        background: 'linear-gradient(135deg, #0575E6, #021B79)',
                        }
                    : { 
                        background: 'transparent',
                        borderColor: '#0575E6',
                        borderWidth: '2px',
                        color: '#0575E6',
                        }
                }
                >
                {isCompleted(7) ? '✓' : 7}
                </div>
                <span 
                className="whitespace-nowrap"
                style={{
                    background: 'linear-gradient(135deg, #0575E6, #021B79)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
                >
                Review & Submit
                </span>
            </div>
            <div className="w-8 h-px mx-2"></div>
        </div>

        </div>
      </div>
    </div>
  )
}