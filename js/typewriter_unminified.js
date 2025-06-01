'use strict';
var speed = 100;
var x = 1;


function repeatWrite()
{
	var i = 0;
	var txt = document.getElementById("demo" + x).innerHTML;
	var txt_null = null;
	document.getElementById("demo" + x).innerHTML = txt_null;

	function typeWriter() 
	{
	  if (i < txt.length) 
	  {
	    document.getElementById("demo" + x).innerHTML += txt.charAt(i);
	    i++;
	    setTimeout(typeWriter, speed);
	  }
	  else{
	  	if(x<1){
		  	x=x+1;
		  	repeatWrite();
		  }
	  }
	}	
	typeWriter();
}
