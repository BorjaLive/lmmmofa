const API_ENDPOINT = "api/index.php";
let apiUser = "";
let apipass = "";

function fetchAPI(action, data) {
    return new Promise((resolve, reject) => {
        data.action = action;
        fetch(API_ENDPOINT, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(apiUser + ":" + apipass)
            },
            redirect: 'follow',
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(data => {
                try {
                    data = JSON.parse(data);
                } catch (error) {
                    reject(data);
                }
                if (data.status == "success")
                    resolve(data.msg);
                else
                    reject(data.msg.error);
            })
            .catch(error => {
                reject(error);
            });
    });
}

{{functions}}

