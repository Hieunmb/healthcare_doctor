const url ={
    BASE_URL:"http://localhost:8080/api/v3",
    PATIENT:{
        REGISTER:"/patients",
    },
    DEPARTMENT:{
        LIST: "/departments",
        DETAIL:"/departments"
    },
    SHIFT:{
        LIST:"/shifts"
    },
    BOOKING:{
        CREATE:"/bookings",
        LIST:"/bookings",
        UPDATE:"/bookings/updateStatus/",
    },
    RESULT:{
        LIST:"/results",
        CREATE:"/results"
    },
    DOCTOR:{
        LOGIN:"/doctors/login",
        PROFILE:"/doctors/profile"
    },
    DEVICE:{
        LIST:"/devices"
    },
    TEST:{
        CREATE:"/tests",
        LIST:"/tests"
    }
}
export default url;