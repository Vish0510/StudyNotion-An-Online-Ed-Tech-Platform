import React, {useEffect, useState} from 'react'
import { useForm } from 'react-hook-form';
// import { apiConnector } from '../../services/apiConnector';
// import { contactusEndpoint } from '../../services/apis';
import CountryCode from '../../data/countrycode.json';


const ContactUsForm = () => {

    const [loading, setLoading] = useState(false);
    const{
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitSuccessful },
    } = useForm();

    const submitContactForm = async(data) => {
        console.log("Logging Form Data", data);
        // API call logic here
        try {
            setLoading(true);
            //const response = await apiConnector("POST", contactusEndpoint.CONTACT_US_API, data);
            const response = {status:"OK"};
            console.log("Logging response", response);
            setLoading(false);
        } 
        catch(error) {
            console.log("Logging error", error.message);
            setLoading(false);
        }
    }

    useEffect(() => {
        if(isSubmitSuccessful) {
            reset({
                email:"",
                firstname:"",
                lastname:"",
                message:"",
                phoneNo:"",
            })
        }
    },[reset, isSubmitSuccessful])


  return (
        <form className="flex flex-col gap-7 "
            onSubmit={handleSubmit(submitContactForm)}
            style={{marginTop: "30px"}}
            >
                <div className='flex flex-col gap-5 lg:flex-row'>
                    {/* firstName */}
                    <div className="flex flex-col gap-2 lg:w-[48%]">
                        <label htmlFor='firstname'
                        className="lable-style">First Name</label>
                        <input
                            type='text'
                            name='firstname'
                            id='firstname'
                            placeholder='Enter your first name'
                            className='form-style bg-richblack-600 rounded-md p-3'
                            {...register("firstname", {required:true})}
                        />
                        {
                            errors.firstname && (
                                <span className="-mt-1 text-[12px] text-yellow-100">Please enter your first name</span>
                            )
                        }
                    </div>
                    {/* lastName */}
                    <div className="flex flex-col gap-2 lg:w-[48%]">
                        <label htmlFor='lastname'
                        className="lable-style">Last Name</label>
                        <input
                            type='text'
                            name='lastname'
                            id='lastname'
                            placeholder='Enter your last name'
                            className='form-style bg-richblack-600 rounded-md p-3'
                            {...register("lastname")}
                        />
                    </div>
                </div>

                {/* email */}
                <div className='flex flex-col gap-2'>
                    <label htmlFor='email' className="lable-style">Email</label>
                    <input
                        type='email'
                        name='email'
                        id='email'
                        placeholder='Enter your email'
                        className='form-style bg-richblack-600 rounded-md p-3'
                        {...register("email", {required:true})}
                    />
                    {
                        errors.email && (
                        <span className="-mt-1 text-[12px] text-yellow-100">Please enter your email</span>
                        )
                    }
                </div>

                {/* phoneNo */}
                <div className='flex flex-col gap-2'>
                    <label htmlFor='phonenumber' className="lable-style">Phone Number</label>

                    <div className='flex gap-5'>
                        {/* dropdown */}
                        <div className="flex w-[81px] flex-col gap-2">
                           <select 
                           name='dropdown'
                           id='dropdown'
                           className='form-style bg-richblack-600 rounded-md p-3' 
                           {...register("countrycode", {required:true})}
                           >
                           {
                            CountryCode.map((element, index) => {
                                return (
                                    <option key={index} value={element.code}>
                                        {element.code} -{element.country}
                                    </option>
                                )
                            })
                           }
                           </select> 
                        </div>
                        {/* phone number input */}
                        <div className='flex w-[calc(100%-90px)] flex-col gap-2'>
                           <input
                            type='number'
                            name='phonenumber'
                            id='phonenumber'
                            placeholder='12345 67890'
                            className='form-style bg-richblack-600 rounded-md p-3'
                            {...register("phoneNo", 
                            {
                                required:{value:true, message:"Please enter your phone number"},
                                maxLength:{value:10, message:"Phone number cannot exceed 10 digits"},
                                minLength:{value:10, message:"Phone number should be at least 10 digits"}})}
                           />
                        </div>
                    </div>
                    {
                        errors.phoneNo && (
                        <span className="-mt-1 text-[12px] text-yellow-100">{errors.phoneNo.message}</span>
                        )
                    }
                </div>

                {/* message */}
                <div className='flex flex-col gap-2 '>
                    <label htmlFor='message' className="lable-style ">Message</label>
                    <textarea
                        name='message'
                        id='message'
                        cols="30"
                        rows="7"
                        placeholder='Enter your message'
                        className='form-style bg-richblack-600 rounded-md p-3'
                        {...register("message", {required:true})}
                    />
                    {
                        errors.message && (
                        <span className="-mt-1 text-[12px] text-yellow-100">Please enter your message</span>
                        )
                    }
                </div>            

                {/* Button */}
                <button type='submit'
                className={`rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
                    ${
                    !loading &&
                    "transition-all duration-200 hover:scale-95 hover:shadow-none"
                    }  disabled:bg-richblack-500 sm:text-[16px] `}
                >    
                    Send Message
                </button>
        </form>
  )
}
export default ContactUsForm;