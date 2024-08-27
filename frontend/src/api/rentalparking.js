import request from "./index";
import { Toast } from '../components';

const rentalList = async () => {
    const data = await request.get(`/user/parkingSpace/`)
    if (!data.error) {
        return {
            ...data,
        }
    }
    else {
        Toast.error(data.error);
    }
};


export { rentalList }