export default function Button({

children,

...props

}){

    return(

        <button

            {...props}

            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"

        >

            {children}

        </button>

    );

}