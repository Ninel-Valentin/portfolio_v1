import { render } from '@react-email/render';
import Consts from './utils/Consts';
import { Email } from './utils/emailTemplate';

export default class emailService {
    static validateForm() {
        let formIsValid = true;
        let inputs = document.querySelectorAll('div.emailRow > input, div.emailRow > textarea');
        inputs.forEach((element, index) => {
            let errorRow = element.parentElement.querySelector('span.errorRow');

            let pattern = element.getAttribute('pattern');
            let regExp = new RegExp(pattern, 'g');

            let isValid = regExp.test(element.value);
            if (!isValid) {
                element.classList.add('invalidRow');
                errorRow.innerText = element.getAttribute('title');
                formIsValid = false;
            }

            if (isValid) {
                element.classList.remove('invalidRow');
                errorRow.innerText = '';
            }
        });
        return formIsValid;
    }

    // static sendEmail() {
    //     const transporter = nodemailer.createTransport({
    //         host: 'smtp:ethereal.email',
    //         port: 587,
    //         secure: false,
    //         auth: {
    //             ...Consts.emailCreds,
    //         },
    //     });

    //     const emailHtml = render(<Email
    //         sender="_sender"
    //         subject="_subject"
    //         body="_body"
    //     />);

    //     const options = {
    //         from: Consts.emailCreds.user,
    //         to: Consts.emailCreds.user,
    //         subject: '__subject',
    //         html: emailHtml
    //     }

    //     // transporter.sendMail(options);
    // }

    static submitForm() {
        if (!emailService.validateForm()) return;
    }
};