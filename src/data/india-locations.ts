// India States, Cities and PIN Codes data for checkout form auto-populate

export interface City {
    name: string;
    pinCode: string;
}

export interface State {
    name: string;
    code: string;
    cities: City[];
}

export const indianStates: State[] = [
    {
        name: "Andhra Pradesh",
        code: "AP",
        cities: [
            { name: "Visakhapatnam", pinCode: "530001" },
            { name: "Vijayawada", pinCode: "520001" },
            { name: "Guntur", pinCode: "522001" },
            { name: "Nellore", pinCode: "524001" },
            { name: "Tirupati", pinCode: "517501" },
            { name: "Kakinada", pinCode: "533001" },
            { name: "Rajahmundry", pinCode: "533101" },
            { name: "Kurnool", pinCode: "518001" },
        ],
    },
    {
        name: "Arunachal Pradesh",
        code: "AR",
        cities: [
            { name: "Itanagar", pinCode: "791111" },
            { name: "Naharlagun", pinCode: "791110" },
            { name: "Pasighat", pinCode: "791102" },
            { name: "Tawang", pinCode: "790104" },
        ],
    },
    {
        name: "Assam",
        code: "AS",
        cities: [
            { name: "Guwahati", pinCode: "781001" },
            { name: "Silchar", pinCode: "788001" },
            { name: "Dibrugarh", pinCode: "786001" },
            { name: "Jorhat", pinCode: "785001" },
            { name: "Nagaon", pinCode: "782001" },
            { name: "Tezpur", pinCode: "784001" },
        ],
    },
    {
        name: "Bihar",
        code: "BR",
        cities: [
            { name: "Patna", pinCode: "800001" },
            { name: "Gaya", pinCode: "823001" },
            { name: "Muzaffarpur", pinCode: "842001" },
            { name: "Bhagalpur", pinCode: "812001" },
            { name: "Darbhanga", pinCode: "846001" },
            { name: "Purnia", pinCode: "854301" },
        ],
    },
    {
        name: "Chhattisgarh",
        code: "CG",
        cities: [
            { name: "Raipur", pinCode: "492001" },
            { name: "Bhilai", pinCode: "490001" },
            { name: "Bilaspur", pinCode: "495001" },
            { name: "Korba", pinCode: "495677" },
            { name: "Durg", pinCode: "491001" },
        ],
    },
    {
        name: "Delhi",
        code: "DL",
        cities: [
            { name: "New Delhi", pinCode: "110001" },
            { name: "North Delhi", pinCode: "110007" },
            { name: "South Delhi", pinCode: "110017" },
            { name: "East Delhi", pinCode: "110091" },
            { name: "West Delhi", pinCode: "110015" },
            { name: "Dwarka", pinCode: "110075" },
            { name: "Rohini", pinCode: "110085" },
        ],
    },
    {
        name: "Goa",
        code: "GA",
        cities: [
            { name: "Panaji", pinCode: "403001" },
            { name: "Margao", pinCode: "403601" },
            { name: "Vasco da Gama", pinCode: "403802" },
            { name: "Mapusa", pinCode: "403507" },
            { name: "Ponda", pinCode: "403401" },
        ],
    },
    {
        name: "Gujarat",
        code: "GJ",
        cities: [
            { name: "Ahmedabad", pinCode: "380001" },
            { name: "Surat", pinCode: "395001" },
            { name: "Vadodara", pinCode: "390001" },
            { name: "Rajkot", pinCode: "360001" },
            { name: "Bhavnagar", pinCode: "364001" },
            { name: "Jamnagar", pinCode: "361001" },
            { name: "Gandhinagar", pinCode: "382010" },
            { name: "Junagadh", pinCode: "362001" },
        ],
    },
    {
        name: "Haryana",
        code: "HR",
        cities: [
            { name: "Gurugram", pinCode: "122001" },
            { name: "Faridabad", pinCode: "121001" },
            { name: "Panipat", pinCode: "132103" },
            { name: "Ambala", pinCode: "134003" },
            { name: "Karnal", pinCode: "132001" },
            { name: "Rohtak", pinCode: "124001" },
            { name: "Hisar", pinCode: "125001" },
        ],
    },
    {
        name: "Himachal Pradesh",
        code: "HP",
        cities: [
            { name: "Shimla", pinCode: "171001" },
            { name: "Dharamshala", pinCode: "176215" },
            { name: "Manali", pinCode: "175131" },
            { name: "Solan", pinCode: "173212" },
            { name: "Mandi", pinCode: "175001" },
            { name: "Kullu", pinCode: "175101" },
        ],
    },
    {
        name: "Jharkhand",
        code: "JH",
        cities: [
            { name: "Ranchi", pinCode: "834001" },
            { name: "Jamshedpur", pinCode: "831001" },
            { name: "Dhanbad", pinCode: "826001" },
            { name: "Bokaro", pinCode: "827001" },
            { name: "Hazaribagh", pinCode: "825301" },
            { name: "Deoghar", pinCode: "814112" },
        ],
    },
    {
        name: "Karnataka",
        code: "KA",
        cities: [
            { name: "Bengaluru", pinCode: "560001" },
            { name: "Mysuru", pinCode: "570001" },
            { name: "Mangaluru", pinCode: "575001" },
            { name: "Hubli", pinCode: "580001" },
            { name: "Belgaum", pinCode: "590001" },
            { name: "Davangere", pinCode: "577001" },
            { name: "Shimoga", pinCode: "577201" },
            { name: "Udupi", pinCode: "576101" },
        ],
    },
    {
        name: "Kerala",
        code: "KL",
        cities: [
            { name: "Thiruvananthapuram", pinCode: "695001" },
            { name: "Kochi", pinCode: "682001" },
            { name: "Kozhikode", pinCode: "673001" },
            { name: "Thrissur", pinCode: "680001" },
            { name: "Kollam", pinCode: "691001" },
            { name: "Kannur", pinCode: "670001" },
            { name: "Alappuzha", pinCode: "688001" },
            { name: "Palakkad", pinCode: "678001" },
        ],
    },
    {
        name: "Madhya Pradesh",
        code: "MP",
        cities: [
            { name: "Bhopal", pinCode: "462001" },
            { name: "Indore", pinCode: "452001" },
            { name: "Jabalpur", pinCode: "482001" },
            { name: "Gwalior", pinCode: "474001" },
            { name: "Ujjain", pinCode: "456001" },
            { name: "Sagar", pinCode: "470001" },
            { name: "Rewa", pinCode: "486001" },
        ],
    },
    {
        name: "Maharashtra",
        code: "MH",
        cities: [
            { name: "Mumbai", pinCode: "400001" },
            { name: "Pune", pinCode: "411001" },
            { name: "Nagpur", pinCode: "440001" },
            { name: "Thane", pinCode: "400601" },
            { name: "Nashik", pinCode: "422001" },
            { name: "Aurangabad", pinCode: "431001" },
            { name: "Navi Mumbai", pinCode: "400701" },
            { name: "Kolhapur", pinCode: "416001" },
            { name: "Solapur", pinCode: "413001" },
        ],
    },
    {
        name: "Manipur",
        code: "MN",
        cities: [
            { name: "Imphal", pinCode: "795001" },
            { name: "Thoubal", pinCode: "795138" },
            { name: "Bishnupur", pinCode: "795126" },
            { name: "Churachandpur", pinCode: "795128" },
        ],
    },
    {
        name: "Meghalaya",
        code: "ML",
        cities: [
            { name: "Shillong", pinCode: "793001" },
            { name: "Tura", pinCode: "794001" },
            { name: "Jowai", pinCode: "793150" },
            { name: "Nongstoin", pinCode: "793119" },
        ],
    },
    {
        name: "Mizoram",
        code: "MZ",
        cities: [
            { name: "Aizawl", pinCode: "796001" },
            { name: "Lunglei", pinCode: "796701" },
            { name: "Champhai", pinCode: "796321" },
            { name: "Kolasib", pinCode: "796081" },
        ],
    },
    {
        name: "Nagaland",
        code: "NL",
        cities: [
            { name: "Kohima", pinCode: "797001" },
            { name: "Dimapur", pinCode: "797112" },
            { name: "Mokokchung", pinCode: "798601" },
            { name: "Tuensang", pinCode: "798612" },
        ],
    },
    {
        name: "Odisha",
        code: "OD",
        cities: [
            { name: "Bhubaneswar", pinCode: "751001" },
            { name: "Cuttack", pinCode: "753001" },
            { name: "Rourkela", pinCode: "769001" },
            { name: "Berhampur", pinCode: "760001" },
            { name: "Sambalpur", pinCode: "768001" },
            { name: "Puri", pinCode: "752001" },
        ],
    },
    {
        name: "Punjab",
        code: "PB",
        cities: [
            { name: "Chandigarh", pinCode: "160001" },
            { name: "Ludhiana", pinCode: "141001" },
            { name: "Amritsar", pinCode: "143001" },
            { name: "Jalandhar", pinCode: "144001" },
            { name: "Patiala", pinCode: "147001" },
            { name: "Bathinda", pinCode: "151001" },
            { name: "Mohali", pinCode: "160055" },
        ],
    },
    {
        name: "Rajasthan",
        code: "RJ",
        cities: [
            { name: "Jaipur", pinCode: "302001" },
            { name: "Jodhpur", pinCode: "342001" },
            { name: "Udaipur", pinCode: "313001" },
            { name: "Kota", pinCode: "324001" },
            { name: "Ajmer", pinCode: "305001" },
            { name: "Bikaner", pinCode: "334001" },
            { name: "Alwar", pinCode: "301001" },
            { name: "Jaisalmer", pinCode: "345001" },
        ],
    },
    {
        name: "Sikkim",
        code: "SK",
        cities: [
            { name: "Gangtok", pinCode: "737101" },
            { name: "Namchi", pinCode: "737126" },
            { name: "Mangan", pinCode: "737116" },
            { name: "Pelling", pinCode: "737113" },
        ],
    },
    {
        name: "Tamil Nadu",
        code: "TN",
        cities: [
            { name: "Chennai", pinCode: "600001" },
            { name: "Coimbatore", pinCode: "641001" },
            { name: "Madurai", pinCode: "625001" },
            { name: "Tiruchirappalli", pinCode: "620001" },
            { name: "Salem", pinCode: "636001" },
            { name: "Tirunelveli", pinCode: "627001" },
            { name: "Erode", pinCode: "638001" },
            { name: "Vellore", pinCode: "632001" },
        ],
    },
    {
        name: "Telangana",
        code: "TS",
        cities: [
            { name: "Hyderabad", pinCode: "500001" },
            { name: "Warangal", pinCode: "506001" },
            { name: "Nizamabad", pinCode: "503001" },
            { name: "Karimnagar", pinCode: "505001" },
            { name: "Khammam", pinCode: "507001" },
            { name: "Secunderabad", pinCode: "500003" },
        ],
    },
    {
        name: "Tripura",
        code: "TR",
        cities: [
            { name: "Agartala", pinCode: "799001" },
            { name: "Udaipur", pinCode: "799120" },
            { name: "Dharmanagar", pinCode: "799250" },
            { name: "Kailashahar", pinCode: "799277" },
        ],
    },
    {
        name: "Uttar Pradesh",
        code: "UP",
        cities: [
            { name: "Lucknow", pinCode: "226001" },
            { name: "Kanpur", pinCode: "208001" },
            { name: "Varanasi", pinCode: "221001" },
            { name: "Agra", pinCode: "282001" },
            { name: "Noida", pinCode: "201301" },
            { name: "Ghaziabad", pinCode: "201001" },
            { name: "Prayagraj", pinCode: "211001" },
            { name: "Meerut", pinCode: "250001" },
            { name: "Bareilly", pinCode: "243001" },
        ],
    },
    {
        name: "Uttarakhand",
        code: "UK",
        cities: [
            { name: "Dehradun", pinCode: "248001" },
            { name: "Haridwar", pinCode: "249401" },
            { name: "Rishikesh", pinCode: "249201" },
            { name: "Nainital", pinCode: "263001" },
            { name: "Haldwani", pinCode: "263139" },
            { name: "Roorkee", pinCode: "247667" },
        ],
    },
    {
        name: "West Bengal",
        code: "WB",
        cities: [
            { name: "Kolkata", pinCode: "700001" },
            { name: "Howrah", pinCode: "711101" },
            { name: "Durgapur", pinCode: "713201" },
            { name: "Asansol", pinCode: "713301" },
            { name: "Siliguri", pinCode: "734001" },
            { name: "Darjeeling", pinCode: "734101" },
            { name: "Kharagpur", pinCode: "721301" },
        ],
    },
];

// Helper function to get cities for a specific state
export function getCitiesByState(stateName: string): City[] {
    const state = indianStates.find((s) => s.name === stateName);
    return state?.cities || [];
}

// Helper function to get PIN code for a specific city in a state
export function getPinCodeByCity(stateName: string, cityName: string): string {
    const cities = getCitiesByState(stateName);
    const city = cities.find((c) => c.name === cityName);
    return city?.pinCode || "";
}
