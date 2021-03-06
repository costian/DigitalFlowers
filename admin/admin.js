var admin = {
	permission:null,
	ui:{
		consts:{
			ICON_DANGER:"fas fa-exclamation-triangle",
			COLOR_DANGER:"ff0000"
		},
		dialogBox:function(e){//text , icon, color
			alert("NEWUI"+e.text);
			
		}
	},
	init:function(){
	

		if(document.getElementsByClassName("user_permission").length>0){
			admin.permission = parseInt(document.getElementsByClassName("user_permission")[0].innerHTML);
		}
		if(document.getElementsByClassName("menu_active").length>0){
			document.getElementsByClassName("menu_active")[0].onclick=function(){
				admin.menu.open();
			}
			if(location.href.split("/").length>4 && location.href.split("/").length<7 && location.href.split("/")[4]!=""){
				switch (location.href.split("/")[4]){
					case "users":	
						admin.menu.close({target:document.getElementsByClassName("menu_list")[0].children[1]});
					break;
					case "products":
						admin.menu.close({target:document.getElementsByClassName("menu_list")[0].children[2]});
					break;
					case "settings":
						admin.menu.close({target:document.getElementsByClassName("menu_list")[0].children[3]});
					break;
				}
			}else{
				admin.menu.close({target:document.getElementsByClassName("menu_list")[0].children[0]});
			}
		}

		if(document.getElementsByClassName("signInBtn").length>0){
			document.getElementsByClassName("signInBtn")[0].onclick=function(){
				admin.signin();
			}
		}
		if(document.getElementsByClassName("logout").length>0){
			document.getElementsByClassName("logout")[0].onclick=function(){
				admin.signout();
			}
		}
	},
	products:{
		removeProduct:function(pid){
			var newBox = document.createElement("div");
			newBox.className="dialog_box";
			newBox.innerHTML="Вы точно хотите удалить продукт? <a class='btn' href='javascript://'>Удалить</a>";
			document.getElementsByClassName("admin_content")[0].appendChild(newBox);
				var closeWin = function(e){
					if(e.target.parentNode.className=="dialog_box"){
						admin.ajaxSend("/api/removeProduct/?id="+pid, function(e){
							if(e.target.response.success==1){
								document.getElementsByClassName("product-"+pid)[0].parentNode.removeChild(document.getElementsByClassName("product-"+pid)[0])
							}else{
								admin.ui.dialogBox({
									text:"Ошибка. "+e.target.response.error,
									icon:admin.ui.consts.DANGER_ICON,
									color:admin.ui.consts.DANGER_COLOR									
								});
							}
						});
					}
					document.removeEventListener("click", closeWin , false);
					newBox.parentNode.removeChild(newBox);
				}
				setTimeout(function(){
					document.addEventListener("click",  closeWin, false);
				},500);
		},
		showProductsList:function(){
			admin.ajaxSend("/api/showProductsList/",function(e){
				if(e.target.response.success==1){
					productsList="<a onclick=\"admin.products.newProduct()\" class=\"btn\" href=\"javascript://\">Add Product</a>";
					productsList+="<table class='pages_list'>\n<tr>\n\t<th>Id</th>\n\t<th>Name</th>\n\t<th>Price</th>\n\t<th>Image</th>\n\t<th>Edit</th>\n\t<th>Remove</th>\n</tr>\n";
					for(var i=0;i<e.target.response.products.length;i++){
						productsList+="<tr class=\"product-"+e.target.response.products[i].id+"\">\n\t<td>"+e.target.response.products[i].id+"</td>\n\t<td>"+e.target.response.products[i].product_name+"</td>\n\t<td>"+e.target.response.products[i].price+"</td>\n\t<td>"+e.target.response.products[i].image+"</td>\n\t<td><a class=\"btn\" onclick=\"admin.products.editProduct("+e.target.response.products[i].id+")\" href=\"javascript://\">Edit</a></td>\n\t<td><a onclick=\"admin.products.removeProduct("+e.target.response.products[i].id+")\" class=\"btn\" href=\"javascript://\">Remove</a></td>\n</tr>";
					}

					productsList+="</table>";
					document.getElementsByClassName("admin_content")[0].innerHTML=productsList;
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		},
		newProduct:function(){
			admin.products.renderProductsEditor({
				product_name:"",
				product_price:"",
				product_old_price:"",
				product_quantity:"",
				product_image:"",
				product_description:"",
				product_id:-1
			});
		},
		editProduct:function(pid){
			admin.ajaxSend("/api/GetProductById/?id="+pid,function(e){
				if(e.target.response.success==1){
					admin.products.renderProductsEditor({
						product_name:e.target.response.product.product_name,
						product_price:e.target.response.product.product_price,
						product_old_price:e.target.response.product.product_old_price,
						product_quantity:e.target.response.product.product_quantity,
						product_image:e.target.response.product.product_image,
						product_description:e.target.response.product.product_description,
						product_id:e.target.response.product.product_id
					});
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		},
		renderProductsEditor:function(e){
			productProps = '<a onclick=\"admin.products.showProductsList()\" class=\"btn\" href=\"javascript://\">Back</a>';
			if(e.product_id!=-1){
				productProps += '<a onclick=\"admin.products.saveProduct('+e.product_id+')\" class=\"btn\" href=\"javascript://\">Save</a>';
			}else{
				productProps += '<a onclick=\"admin.products.addProduct()\" class=\"btn\" href=\"javascript://\">Add</a>';
			}
			productProps += '<div class="product_field"><div class="prop_title">Name</div><input class="name_field" value="'+e.product_name+'"></div>';
			productProps += '<div class="product_field"><div class="prop_title">Price</div><input class="price_field" value="'+e.product_price+'"></div>';
			productProps += '<div class="product_field"><div class="prop_title">Old Price</div><input class="old_price_field" value="'+e.product_old_price+'"></div>';
			productProps += '<div class="product_field"><div class="prop_title">Quantity</div><input class="quantity_field" value="'+e.product_quantity+'"></div>';
			productProps += '<div class="product_field"><div class="prop_title">Cover</div><input class="image_field" value="'+e.product_image+'"></div>';
			productProps += '<div class="product_field"><div class="prop_title">Description</div><textarea class="description_field">'+e.product_description+'</textarea></div>';
					document.getElementsByClassName("admin_content")[0].innerHTML=productProps;
		},
		saveProduct:function(pid){
			name=document.getElementsByClassName("name_field")[0].value;
			price=document.getElementsByClassName("price_field")[0].value;
			old_price=document.getElementsByClassName("old_price_field")[0].value;
			quantity=document.getElementsByClassName("quantity_field")[0].value;
			image=document.getElementsByClassName("image_field")[0].value;
			description=document.getElementsByClassName("description_field")[0].value;

			admin.ajaxSend("/api/saveProduct/?id="+pid+"&name="+name+"&price="+price+"&old_price="+old_price+"&quantity="+quantity+"&image="+image+"&description="+description,function(e){
				if(e.target.response.success==1){
					alert("Сохранено");
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		},
		addProduct:function(){
			name=document.getElementsByClassName("name_field")[0].value;
			price=document.getElementsByClassName("price_field")[0].value;
			old_price=document.getElementsByClassName("old_price_field")[0].value;
			quantity=document.getElementsByClassName("quantity_field")[0].value;
			image=document.getElementsByClassName("image_field")[0].value;
			description=document.getElementsByClassName("description_field")[0].value;

			admin.ajaxSend("/api/addProduct/?name="+name+"&price="+price+"&old_price="+old_price+"&quantity="+quantity+"&image="+image+"&description="+description,function(e){
				if(e.target.response.success==1){
					alert("Сохранено");
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		}
	},
	users:{
		typeNames:["Редактор", "Модератор", "Администратор"],
		saveUser:function(uid){
			var dataList = "/api/saveUser/?";
			dataList+="id="+uid;
			if(document.getElementsByClassName("password_field")[0].value!==""){
				dataList+="&password="+document.getElementsByClassName("password_field")[0].value;
			}
			if(document.getElementsByClassName("login_field")[0].value!==""){
				dataList+="&login="+document.getElementsByClassName("login_field")[0].value;
			}
			if(document.getElementsByClassName("group_field")[0].value!==""){
				dataList+="&group="+document.getElementsByClassName("group_field")[0].value;
			}
			admin.ajaxSend(dataList,function(e){
				if(e.target.response.success==1){
					alert("Пользователь сохранён.");
					admin.users.showUsersList();
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});

		},
		addUser:function(id){
			login=document.getElementsByClassName("login_field")[0].value;
			password=document.getElementsByClassName("password_field")[0].value;
			group=document.getElementsByClassName("group_field")[0].value;

			admin.ajaxSend("/api/addUser/?login="+login+"&group="+group+"&password="+password,function(e){
				if(e.target.response.success==1){
					alert("Пользователь добавлен.");
					admin.users.showUsersList();
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		},
		outUser:function(id){
			admin.ajaxSend("/api/outUser/?id="+id,function(e){
				if(e.target.response.success==1){
					alert("Пользователь вышел.");
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
			//log out user with specific id
		},
		renderUserEditor:function(e){
			userProps = '<a onclick=\"admin.users.showUsersList()\" class=\"btn\" href=\"javascript://\">Back</a>';

					if(e.user_id!=-1){
						userProps += '<a onclick=\"admin.users.saveUser('+e.user_id+')\" class=\"btn\" href=\"javascript://\">Save</a>'
					}else{
						userProps += '<a onclick=\"admin.users.addUser()\" class=\"btn\" href=\"javascript://\">Add</a>'
					}

					userProps += '<div class="user_field"><div class="prop_login">Login</div><input class="login_field" value="'+e.user_login+'"></div>'
					
					userProps += '<select class="group_field">';
					for(var i = 0;i<admin.permission+1;i++){
						if(e.user_group==i){
							userProps += '<option value="'+i+'" selected>'+admin.users.typeNames[i]+'</option>';
						}else{
							userProps += '<option value="'+i+'">'+admin.users.typeNames[i]+'</option>';
						}
					}
					userProps += '</select>';

					//'<div class="user_field"><div class="prop_group">Group</div><input class="title_field" value="'++'"></div>'


					userProps += '<div class="user_field"><div class="prop_title">Password</div><input class="password_field" value="'+e.user_password+'"></div>'
					document.getElementsByClassName("admin_content")[0].innerHTML=userProps;
			//UserEditor
			//id

			//login
			//group
			//password
			
		},
		editUser:function(uid){
			admin.ajaxSend("/api/GetUserById/?id="+uid,function(e){
				if(e.target.response.success==1){					
					admin.users.renderUserEditor({
						user_password: "",
						user_login: e.target.response.user.login,
						user_group: e.target.response.user.group,
						user_id: e.target.response.user.id
					});
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		},
		newUser:function(){
					admin.users.renderUserEditor({
						user_login:"",
						user_group:"",
						user_password:"",
						user_id:-1
					});
		},



		removeUser:function(uid){
			var newBox = document.createElement("div");
			newBox.className="dialog_box";
			newBox.innerHTML="Вы точно хотите удалить пользователя? <a class='btn' href='javascript://'>Удалить</a>";
			document.getElementsByClassName("admin_content")[0].appendChild(newBox);
			var closeWin = function(e){
				if(e.target.parentNode.className=="dialog_box"){
					admin.ajaxSend("/api/removeUser/?id="+uid,function(e){
						if(e.target.response.success==1){
							document.getElementsByClassName("user-"+uid)[0].parentNode.removeChild(document.getElementsByClassName("user-"+uid)[0])
						}else{
							admin.ui.dialogBox({
								text:"Ошибка. "+e.target.response.error,
								icon:admin.ui.consts.DANGER_ICON,
								color:admin.ui.consts.DANGER_COLOR									
							});
						}
					});
				}
				document.removeEventListener("click", closeWin , false);
				newBox.parentNode.removeChild(newBox);
			}
			setTimeout(function(){
				document.addEventListener("click",  closeWin, false);
			},500);
		},
		showUsersList:function(){
			admin.ajaxSend("/api/showUsersList/",function(e){
				if(e.target.response.success==1){
					//console.log(e.target.response.users[0]);
					usersList="<a onclick=\"admin.users.newUser()\" class=\"btn\" href=\"javascript://\">Add User</a>";
					usersList+="<table class='pages_list'>\n<tr>\n\t<th>Id</th>\n\t<th>Login</th>\n\t<th>Group</th>\n\t<th>Signout</th>\n\t<th>Edit</th>\n\t<th>Remove</th>\n</tr>\n";
					for(var i=0;i<e.target.response.users.length;i++){
						usersList+="<tr class=\"user-"+e.target.response.users[i].id+"\">\n\t<td>"+e.target.response.users[i].id+"</td>\n\t<td>"+e.target.response.users[i].login+"</td>\n\t<td>"+admin.users.typeNames[parseInt(e.target.response.users[i].group)]+"</td>\n\t<td><a onclick=\"admin.users.outUser("+e.target.response.users[i].id+")\" class=\"btn\" href=\"javascript://\">Exit</a></td>\n\t<td><a class=\"btn\" onclick=\"admin.users.editUser("+e.target.response.users[i].id+")\" href=\"javascript://\">Edit</a></td>\n\t<td><a onclick=\"admin.users.removeUser("+e.target.response.users[i].id+")\" class=\"btn\" href=\"javascript://\">Remove</a></td>\n</tr>";

					}

					usersList+="</table>";
					document.getElementsByClassName("admin_content")[0].innerHTML=usersList;
					//console.log(e.target.response.users[0].login);
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		}
		//
	},
	pages:{
		dragAction:false,
		saveOrderPages:function(){
			var ids = [];
			for(var i=1;i<document.getElementsByClassName("pages_list")[0].children[0].children.length;i++){
				pageTrId = parseInt(document.getElementsByClassName("pages_list")[0].children[0].children[i].classList[1].replace("page-",""));
				ids.push(pageTrId);
			}
				admin.ajaxSend("/api/saveOrderPages/?ids="+ids.join(","),function(e){
					if(e.target.response.success==1){
						alert("Порядок сохранён.");
					}else{
						admin.ui.dialogBox({
							text:"Ошибка. "+e.target.response.error,
							icon:admin.ui.consts.DANGER_ICON,
							color:admin.ui.consts.DANGER_COLOR									
						});
					}
				});
				
		},
		renderPageEditor:function(e){
					pageProps = '<a onclick=\"admin.pages.showPagesList()\" class=\"btn\" href=\"javascript://\">Back</a>';
					if(e.page_id!=-1){
						pageProps += '<a onclick=\"admin.pages.savePage('+e.page_id+')\" class=\"btn\" href=\"javascript://\">Save</a>'
					}else{
						pageProps += '<a onclick=\"admin.pages.addPage()\" class=\"btn\" href=\"javascript://\">Add</a>'
					}
					pageProps += '<div class="page_field"><div class="prop_title">URL</div><input class="url_field" value="'+e.page_url+'"></div>'
					pageProps += '<div class="page_field"><div class="prop_title">Title</div><input class="title_field" value="'+e.page_title+'"></div>'
					statusbar_status = "status_disabled"
					if(e.page_status==1){
						statusbar_status = "status_enabled"
					}
					pageProps += '<div class="page_field"><div class="prop_title">Status</div><div class="status '+statusbar_status+'"></div><input class="status_field" style="display:none;" value="'+e.page_status+'"></div>'
					pageProps += '<textarea class="source_field">'+e.page_source+'</textarea>'
					document.getElementsByClassName("admin_content")[0].innerHTML=pageProps;
					document.getElementsByClassName("status")[0].onclick=function(){
						if(document.getElementsByClassName("status_field")[0].value==1){
							document.getElementsByClassName("status_field")[0].value=0;
							document.getElementsByClassName("status")[0].classList.remove("status_enabled");
							document.getElementsByClassName("status")[0].classList.add("status_disabled");
						}else{
							document.getElementsByClassName("status_field")[0].value=1;
							document.getElementsByClassName("status")[0].classList.remove("status_disabled");
							document.getElementsByClassName("status")[0].classList.add("status_enabled");
						}
					}
		},
		newPage:function(){
					admin.pages.renderPageEditor({
						page_url:"",
						page_title:"",
						page_status:"",
						page_source:"",
						page_id:-1
					});
		},
		savePage:function(pageId){
			url=document.getElementsByClassName("url_field")[0].value;
			title=document.getElementsByClassName("title_field")[0].value;
			status=document.getElementsByClassName("status_field")[0].value;
			source=document.getElementsByClassName("source_field")[0].value;

			admin.ajaxSend("/api/savePage/?id="+pageId+"&url="+url+"&title="+title+"&source="+source+"&status="+status,function(e){
				if(e.target.response.success==1){
					alert("Сохранено");
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		},
		addPage:function(){
			url=document.getElementsByClassName("url_field")[0].value;
			title=document.getElementsByClassName("title_field")[0].value;
			status=document.getElementsByClassName("status_field")[0].value;
			source=document.getElementsByClassName("source_field")[0].value;

			admin.ajaxSend("/api/addPage/?url="+url+"&title="+title+"&source="+source+"&status="+status,function(e){
				if(e.target.response.success==1){
					alert("Сохранено");
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		},
		editPage:function(pageId){
			admin.ajaxSend("/api/GetPageById/?id="+pageId,function(e){
				if(e.target.response.success==1){
					//console.log(e.target.response);
					
					admin.pages.renderPageEditor({
						page_url:e.target.response.page.url,
						page_title:e.target.response.page.title,
						page_status:e.target.response.page.status,
						page_source:e.target.response.page.pagesource,
						page_id:e.target.response.page.id
					});
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		},
		removePage:function(pageId){
			//alert(pageId);
			var newBox = document.createElement("div");
			newBox.className="dialog_box";
			newBox.innerHTML="Вы точно хотите удалить страницу? <a class='btn' href='javascript://'>Удалить, ага, е, ага</a>";
			document.getElementsByClassName("admin_content")[0].appendChild(newBox);
			var closeWin = function(e){
				if(e.target.parentNode.className=="dialog_box"){
					admin.ajaxSend("/api/removePage/?id="+pageId,function(e){
						if(e.target.response.success==1){
							document.getElementsByClassName("page-"+pageId)[0].parentNode.removeChild(document.getElementsByClassName("page-"+pageId)[0])
						}else{
							admin.ui.dialogBox({
								text:"Ошибка. "+e.target.response.error,
								icon:admin.ui.consts.DANGER_ICON,
								color:admin.ui.consts.DANGER_COLOR									
							});
						}
					});
				}
				document.removeEventListener("click", closeWin , false);
				newBox.parentNode.removeChild(newBox);
			}
			setTimeout(function(){
				document.addEventListener("click",  closeWin, false);
			},500)
		},
		showPagesList:function(){
			admin.ajaxSend("/api/GetPages/",function(e){
				if(e.target.response.success==1){
					pagesList="<a onclick=\"admin.pages.newPage()\" class=\"btn\" href=\"javascript://\">Add page</a><a onclick=\"admin.pages.saveOrderPages()\" class=\"btn\" href=\"javascript://\">Save Order</a>"
					pagesList+="<table class='pages_list'>\n<tr>\n\t<th>id</th>\n\t<th>title</th>\n\t<th>url</th>\n\t<th>Edit</th>\n\t<th>Order</th>\n\t<th>Remove</th>\n</tr>\n";
					for(var i=0;i<e.target.response.pages.length;i++){
						pagestatus="enabled_page";
						if(e.target.response.pages[i].status==0){
							pagestatus="disabled_page";
						}
						pagesList+="<tr class=\""+pagestatus+" page-"+e.target.response.pages[i].id+"\">\n\t<td>"+e.target.response.pages[i].id+"</td>\n\t<td>"+e.target.response.pages[i].title+"</td>\n\t<td>"+e.target.response.pages[i].url+"</td><td><a class=\"btn\" onclick=\"admin.pages.editPage("+e.target.response.pages[i].id+")\" href=\"javascript://\">Edit</a></td><td class=\"drag\"><i class=\"fas fa-bars\"></i><div style=\"display:none\">"+e.target.response.pages[i].order+"</div></td><td><a onclick=\"admin.pages.removePage("+e.target.response.pages[i].id+")\" class=\"btn\" href=\"javascript://\">Remove</a></td>\n</tr>\n";
					}
					pagesList+="</table>"
					document.getElementsByClassName("admin_content")[0].innerHTML=pagesList;

					var firElement;
					var secElement;
					var newElement = {innerHTML:null, className:null};


					var dragend = function(that){
						secElement = that.target.parentNode;
						if(secElement.classList!=undefined){
						if(secElement.classList[0]=="enabled_page" || secElement.classList[0]=="disabled_page"){
							newElement.innerHTML = firElement.innerHTML;
							newElement.className = firElement.className;

							firElement.innerHTML = secElement.innerHTML;
							firElement.className = secElement.className;

							secElement.innerHTML = newElement.innerHTML;
							secElement.className = newElement.className;
						}
						}
						document.removeEventListener("mouseup", dragend , false);
						document.addEventListener('mousedown', dragstart);

					}
					var dragstart = function(that){
						firElement = that.target.parentNode;
						if(firElement.classList!=undefined){
						if(firElement.classList[0]=="enabled_page" || firElement.classList[0]=="disabled_page"){
							document.removeEventListener("mousedown", dragstart , false);
							document.addEventListener('mouseup', dragend);
						}
						}
					}
					if(admin.pages.dragAction==false){
						admin.pages.dragAction=true;
						document.addEventListener('mousedown', dragstart);
					}
				}else{
					admin.ui.dialogBox({
						text:"Ошибка. "+e.target.response.error,
						icon:admin.ui.consts.DANGER_ICON,
						color:admin.ui.consts.DANGER_COLOR									
					});
				}
			});
		}
	},
	menu:{
		close:function(e){
			if(e.target.parentNode.className=="menu_list"){
				switch(e.target.innerHTML){
					case "Pages":
						admin.pages.showPagesList();
						window.history.pushState('/admin/', 'Pages', '/admin/');
					break;
					case "Users":
						admin.users.showUsersList();
						window.history.pushState('/admin/users/', 'Users', '/admin/users/');
					break;
					case "Products":
						admin.products.showProductsList();
						window.history.pushState('/admin/products/', 'Products', '/admin/products/');
					break;
					case "Settings":
						admin.pages.showSettings();
						window.history.pushState('/admin/settings/', 'Settings', '/admin/settings/');
					break;
				}
				document.getElementsByClassName("menu_active")[0].innerHTML=e.target.innerHTML;
			}
			document.getElementsByClassName("menu_list")[0].style.display="none";
			document.removeEventListener("click", admin.menu.close , false);
		},
		open:function(){
			document.getElementsByClassName("menu_list")[0].style.display="block";
			setTimeout(function(){
				document.addEventListener("click", admin.menu.close , false);
			});
			
		}
	},
	signout:function(){
		admin.ajaxSend("/api/Exit/",function(e){
			if(e.target.response.success==1){
				alert("Вы успешно вышли");
				location.reload();
			}else{
				admin.ui.dialogBox({
					text:"Ошибка. "+e.target.response.error,
					icon:admin.ui.consts.DANGER_ICON,
					color:admin.ui.consts.DANGER_COLOR									
				});
			}
		});
	},
	signin:function(){
		authlogin = document.getElementsByClassName("loginInput")[0].value;
		authPassword = document.getElementsByClassName("passwordInput")[0].value;
		admin.ajaxSend("/api/Auth/?login="+authlogin+"&password="+authPassword,function(e){
			if(e.target.response.success==1){
				alert("Авторизованы");
				setTimeout(function(){
					location.reload();
				},500)
			}else{
				admin.ui.dialogBox({
					text:"Ошибка. "+e.target.response.error,
					icon:admin.ui.consts.DANGER_ICON,
					color:admin.ui.consts.DANGER_COLOR									
				});
			}
		});
	},
	ajaxSend:function(url,callback){
		var oReq = new XMLHttpRequest();
		oReq.onload = function (e) {
			callback(e);
		    //results.innerHTML = e.target.response.message;
		};
		oReq.open('GET', url, true);
		oReq.responseType = 'json';
		oReq.send();
	}
}
window.onload=function(){
	admin.init();
}
