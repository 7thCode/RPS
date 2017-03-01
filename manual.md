

##resource


    mimetypeがtext/htmlの場合、Articleの値を参照可能



####評価

   　例
   
            article = {field1:"BBBB"};
            
            の場合、
   
           <div>AAAA|{"name":"field1","type":"string"}|CCCC</div>

            は
            
           <div>AAAABBBBCCCC</div>
    
            と評価される。同様に、Attributeは
            
          
           <div x='AAAA|{"name":"field1","type":"string"}|CCCC'>ZZZZ</div>

            の場合
            
           <div x='AAAABBBBCCCC'>ZZZZ</div>

            と評価される。
            
            
          type
            
                "string"
            
                    値を文字列としてそのまま評価
                
                "number"
                
                    値を数値として、Intl.NumberFormatによって評価、フォーマッティング。
                    
                    例
                        article = {field1:"10000"};
                        
                        <div>AAAA|{"name":"field1","type":"number","option":{"style":"currency","currency":"JPY"}}|CCCC</div>
                        
                        の場合、

                        <div>AAAA¥10,000CCCC</div>
       
            
                "date"
                
                    値を日付として、Intl.DateTimeFormatによって評価、フォーマッティング。
                                        
                "formula":
                 
                    値を式として評価。
                    
                ”function”
                
                    値を"value"としてoptionの"function"を関数として評価。

          
            
                
                    
            
####repeat            
            
   例         

            article = [{field1:"QQQQ"},{field1:"WWWW"},{field1:"EEEE"}];
                        
             の場合、
            
            
            <repeat>
                 <div>AAAA|{"name":"field1","type":"string"}|CCCC</div>
            </repeat>
            
            は
            
            <div x='AAAAQQQQCCCC'>ZZZZ</div>
            <div x='AAAAWWWWCCCC'>ZZZZ</div>
            <div x='AAAAEEEECCCC'>ZZZZ</div>
            
            と評価される。
            
            
            特殊な名前
                             
                 {create}
                 
                    Article作成時
                 
                 {modify}
                 
                    Article更新時
                        
                 {name}
                            
                     対象Article名      
                     repeat中で使用
                     
                 {userid}
                                 
                     対象Article UserID                    
                     repeat中で使用
                        
                     
                 詳細ページへのリンクなどこんな感じに使用
                        
                    <a href='http://domain.../articles/resource/|{userid}|/詳細ページ/|{name}'>詳細</a>     