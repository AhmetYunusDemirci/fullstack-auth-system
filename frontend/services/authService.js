import API_URL from "../lib/api";

export async function registerUser(formData) {

    const response = await fetch(`${API_URL}/auth/register`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(formData)

    });

    return response;
}

export async function loginUser(formData){

    const response = await fetch(`${API_URL}/auth/login`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(formData)

    });

    return response;
}