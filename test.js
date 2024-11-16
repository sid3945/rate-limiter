import axios from 'axios';

const url = 'http://localhost:65535/test';
const totalRequests = 200; 
const concurrentRequests = 100;

const sendRequests = async () => {
    const results = { success: 0, failed: 0 };

    const makeRequest = async () => {
        try {
            const response = await axios.get(url);
            console.log('Success:', response.data);
            results.success++;
        } catch (error) {
            if (error.response) {
                console.error('Failed:', error.response.data);
                results.failed++;
            } else {
                console.error('Error:', error.message);
                results.failed++;
            }
        }
    };

    const promises = [];
    for (let i = 0; i < totalRequests; i++) {
        promises.push(makeRequest());
        if (promises.length === concurrentRequests || i === totalRequests - 1) {
            await Promise.all(promises); // Wait for current batch to complete
            promises.length = 0; // Reset the array for the next batch
        }
    }

    console.log(`Total Requests Sent: ${totalRequests}`);
    console.log(`Successful Requests: ${results.success}`);
    console.log(`Failed Requests: ${results.failed}`);
};

sendRequests();
