import { Html } from '@react-email/html';

export function Email(args) {
    const { sender, subject, body } = args;
    return (
        <Html lang="en">
            {sender} | {subject} | {body}
        </Html>
    );
}