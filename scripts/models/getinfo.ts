import { ApiStatus, GetInfoApiResponse } from '../types/types';
export class GetInfo {
    public name: string;
    public email: string;
    
    public async initData(){
        const response = await fetch('../api/get_info.php',{
            method: 'GET'
        });
        
        const data: GetInfoApiResponse = await response.json();

        if(data.status == ApiStatus.Success){
            const info = data.data;
            if (info !== undefined){
                this.name = info.admin_name;
                this.email = info.admin_email;
            }
        }
        else{
            throw new Error('Could not fetch info')
        }
        
    }
}