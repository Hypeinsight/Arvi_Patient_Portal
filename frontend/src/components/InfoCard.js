import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Info, Check } from "lucide-react";
import { Button } from './ui/button';

export default function InfoCard({
  title,
  description,
  icon: IconComponent = Info,
  buttonText,
  buttonIcon: ButtonIcon,
  onClick,
  actionButton,
  className = ""
}) {
  const isCheckIcon = IconComponent === Check;

  return (
    <Card className={`mb-6 border-blue-200 bg-blue-50 h-auto ${className}`}>
      <CardContent className="p-3 sm:p-4 md:p-6 h-full flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
          
          {/* Left Side: Icon & Texts */}
          <div className="flex items-start gap-1 sm:gap-3 md:gap-4">
            {/* <IconComponent
              className="w-5 h-5 text-blue-600 stroke-white shrink-0 mt-0.5"
              fill="currentColor"
            /> */}

            {isCheckIcon ? (
              /* Green Square Badge Style for Check Icon */
              <div className="w-5 h-5 rounded-md bg-green-700 flex items-center justify-center shrink-0 mt-0.5">
                <IconComponent className="w-3.5 h-3.5 text-white" />
              </div>
            ) : (
              /* Default Blue Style for Info Icon (or others) */
              <IconComponent
                className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"
              />
            )}
            <div>
              <h3 className="text-sm xs:text-md md:text-lg font-semibold text-gray-900 mb-1 leading-none">
                {title}
              </h3>
              <p className="text-gray-600 text-xs md:text-sm">
                {description}
              </p>
            </div>
          </div>

          {buttonText && (
            <div className="flex items-center shrink-0 self-auto">
              <Button
                onClick={onClick}
                className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white rounded-full cursor-pointer hover:opacity-90 transition-opacity duration-500 ease-in-out px-2 sm:px-3 md:px-5 min-w-[70px] sm:min-w-[90px] text-xs sm:text-sm md:text-base flex items-center gap-2"
              >
                {buttonText}
                {/* Renders the button icon only if passed */}
                {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
              </Button>
            </div>
          )}
          
        </div>
      </CardContent>
    </Card>
  );
}
