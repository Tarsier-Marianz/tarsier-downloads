var URL_AUTH = "http://192.168.0.209/blocks/index.php";
var Authentication = (function (){
	return {
		validate: function(options){
			var $this = {};
			if(options.action && typeof options.action !=='undefined'){
				$this.action = options.action;
			}				
			if(options.button_id && typeof options.button_id !=='undefined'){
				$this.button_id = options.button_id;
			}			
			if(options.form_id && typeof options.form_id !=='undefined'){
				if(options.form_id.indexOf('#')===0){
					$this.form_id = options.form_id;
				}else{
					$this.form_id = "#"+options.form_id;
				}
			}else{
				$this.form_id = "#dummy_form";
			}

			var $serialize_data = $($this.form_id).serialize()+'&'+$.param({'action': $this.action});
			$.ajax({
				type: "POST",dataType: "json",url: URL_AUTH,data: $serialize_data,
				success: function(response){
					if(response.error){						
						var $errors='';
						if(typeof response.message =='undefined'){
							$($this.form_id+' .form-group').each(function(){
								$(this).removeClass('form-group-red');
							});
							$.map(response, function(val, key) {														
								$('#'+key).parent().closest(".form-group").addClass('form-group-red');
								if(key!='error'){
									$errors += (val+'<br>');
								}
							});
						}else{
							$errors += (response.message+'<br>');
						}	
					}else{
						//location.reload();
					}
				},
				beforeSend:function(){
					
				}
			});
		}		
	};
}());
$(document).ready(function(){	
	$("#signin_button").click(function(){
		Authentication.validate({form_id: 'signin_form',action : 'login'});
		return false;
	});	
	$("#signup_button").click(function(){	
		Authentication.validate({form_id: 'signup_form',action : 'register'});
		return false;
	});
});