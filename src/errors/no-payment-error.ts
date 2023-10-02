import { ApplicationError } from '@/protocols';

export function noPaymentError(): ApplicationError {
    return {
        name: 'noPaymentError',
        message: "This enrollment hasn't been paid for!",
    };
}
