public with sharing class carsController {
    @AuraEnabled(cacheable=true)
    public static List<sObject> fetchCars(String search, Integer rate, List<String> type, List<String> make, String userCity ){
        //created dynamic version of below SOQL 
       
        String whereC = '';
        String[] condition = new List<String>{};

        //handles search text input
        if(!String.isEmpty(search)){
            String searchKey = '%'+search.normalizeSpace()+'%';
            condition.add('Name LIKE :searchKey');
        }

        //handles slider filter
        if(rate >= 0){
            condition.add('Daily_Rate__c <= :rate');
        }

         //handles vehicle type checkbox filter
        if(type.size()>0){
            condition.add('Vehicle_Type__c IN :type');
        }

        //handles vehicle make checkbox filter
        if(make.size()>0 && make[0] != 'All'){
            condition.add('Vehicle_Make__c IN :make');
        }

        //validation user input? plus city on fields? 
        //handles search text input
        if(!String.isEmpty(userCity)){
        String city = userCity.normalizeSpace();
        condition.add('car_location__r.city__c = :city');
        }

        //if any filter condition is applied by user
        if(condition.size() > 0){
            whereC = ' WHERE ' + String.join(condition, ' AND ');
        }

      

        String query = 'SELECT Id, OwnerId, Name, Vehicle_Type__c, Vehicle_Make__c, Daily_Rate__c, Transmission__c, ' +
            'Vehicle_Year__c, Description__c, Image_1__c, Image_2__c, Image_3__c, ' + 
            'car_location__r.name, car_location__r.city__c, car_location__r.state__c, car_location__r.zip_code__c, ' +
            'car_location__r.country__c FROM Car__c' + whereC ;

        return Database.query(query);

    }
}
