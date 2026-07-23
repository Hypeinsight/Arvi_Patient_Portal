import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

export default function InfoCard({
  title,
  description,
  icon: IconComponent = Info,
  buttonText,
  buttonIcon: ButtonIcon,
  buttonIconClassName = "",
  buttonClassName = "",
  buttonDisabled = false,
  onClick,
  className = "",
  loading = false,
}) {
  const isCheckIcon = IconComponent === Check;

  return (
    <Card
      className={`mb-6 h-auto ${className} bg-blue-50 rounded-lg xs:rounded-2xl`}
    >
      <CardContent className="p-3 sm:p-4 md:px-6 md:py-5 h-full flex items-center font-poppins">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 xs:gap-4 w-full">
          {/* Left Side: Icon & Texts */}
          <div className="flex items-start gap-1 sm:gap-3 md:gap-4">
            {isCheckIcon ? (
              /* Green Square Badge Style for Check Icon */
              <div className="w-5 h-5 rounded-md bg-green-700 items-center justify-center shrink-0 mt-0.5 hidden sm:flex">
                <IconComponent className="w-3.5 h-3.5 text-white" />
              </div>
            ) : (
              /* Default Blue Style for Info Icon (or others) */
              <Image
                src="/infoIcon.png"
                width={20}
                height={20}
                alt="Info Icon"
                className="w-4 md:w-5 h-4 md:h-5 hidden sm:block"
              />
            )}
            <div>
              <h3 className="text-sm xs:text-md md:text-lg font-medium text-slate mb-1 leading-none">
                {title}
              </h3>
              <p className="text-slate text-xs md:text-sm 2xl:text-base">
                {description}
              </p>
            </div>
          </div>

          {buttonText && (
            <div className="flex items-center shrink-0 self-auto w-full sm:w-auto">
              <Button
                onClick={onClick}
                disabled={buttonDisabled}
                className={`${buttonClassName} bg-gradient-to-tr from-[#032B4A] to-[#0575E6] h-9 xs:h-11 text-white rounded-xl cursor-pointer hover:opacity-90 transition-opacity duration-500 ease-in-out px-2 sm:px-3 md:px-10 w-full min-w-[70px] sm:min-w-[90px] text-xs sm:text-sm flex items-center gap-2`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {/* Renders the button icon only if passed */}
                    {ButtonIcon && (
                      <ButtonIcon
                        className={`w-4 h-4 ${buttonIconClassName}`}
                      />
                    )}
                    {buttonText}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
