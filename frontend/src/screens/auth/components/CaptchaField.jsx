import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

const CaptchaField = ({ onChange }) => {
    console.log("Recaptcha sitekey:", process.env.REACT_APP_RECAPTCHA_SITE_KEY);
    return (
        <div className="mb-3">
            <label className="form-label">Подтвердите, что вы не робот</label>
            <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={onChange}
            />
        </div>
    );
};

export default CaptchaField;
