import React from 'react'
import HighlightText from './HighlightText';
import know_your_progress from "../../../assets/Images/Know_your_progress.png"
import compare_with_others from "../../../assets/Images/Compare_with_others.png"
import plan_your_lessons from "../../../assets/Images/Plan_your_lessons.png"
import CTAButton from "../HomePage/Button";

const LearningLanguageSection = () => {
  return (
    <div className='mt-[110px] mb-32'>
        <div className='flex flex-col gap-5 items-center'>
            {/* Heading */}
            <div className='text-4xl font-semibold text-center'>
                Your Swiss Knife for
                <HighlightText text={" learning any language"}/>
            </div>

            {/* Subheading */}
            <div className='text-center text-richblack-700 mx-auto text-base font-medium w-[70%]'>
                Using spin making learning multiple languages easy. with 20+ languages realistic voice-over, progress tracking, custom schedule and more.
            </div>

            {/* Images */}
            <div className='flex flex-col lg:flex-row  items-center justify-center mt-8 lg:mt-0'> 
                <img 
                    src = {know_your_progress}
                    alt = "Know Your Progress"
                    className='object-contain -mr-32'
                />
                <img 
                    src = {compare_with_others}
                    alt = "Compare With Others"
                    className='object-contain lg:-mb-10 lg:-mt-0 -mt-12'
                />
                <img 
                    src = {plan_your_lessons}
                    alt = "Plan Your Lessons"
                    className='object-contain  lg:-ml-36 lg:-mt-5 -mt-16'
                />
            </div>

            {/* Button */}
            <div className='w-fit mx-auto mt-10'>
                <CTAButton active={true} linkto={"/signup"}>
                    <div>
                        Learn More
                    </div>
                </CTAButton>
            </div>
        </div>   
    </div>
  )
}

export default LearningLanguageSection