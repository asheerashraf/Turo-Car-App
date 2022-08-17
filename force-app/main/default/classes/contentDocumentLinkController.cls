public with sharing class contentDocumentLinkController {
    
    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getContentDocumentIds(List<String> recordIds){
        return [SELECT LinkedEntityId, ContentDocumentId 
            FROM ContentDocumentLink 
            WHERE LinkedEntityId IN :recordIds];
    }

    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getContentVersionIds(List<String> contentIds){
        return [SELECT Id, ContentDocumentId, Title  
            FROM ContentVersion 
            WHERE ContentDocumentId IN :contentIds];
    }

    /*
    Map<String, List<ContentDocumentLink>> one = new Map<String, List<ContentDocumentLink>>();

    Object{
        LinkedEntityId: ,
        ContentDocumentId: ,
        VersionId: ,
        Title: ,
    }

    //set (Id, contentdocumentlink)
    //set (Id, contentversion)
    */

}


