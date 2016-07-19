import $ from 'jquery';
import './styles/common.css';
import './styles/pad.css';

import io from 'socket.io-client';

let root_el = $('#root');
let map = $('<div id="map"></div>');
let holes = $('<div id="holes"></div>');

root_el.append(map);
root_el.append(holes);

//узнать ip сервера
$.get('/serverip', (serverip) => {

	const socket = io('http://'+serverip);

	socket.on('connect', () => {
		// root_el.html('socket connected to '+serverip);
	});
	
	socket.on('listofholes', (listofholes) => {

		let holes_markup = '';
		listofholes.forEach(hole=> {
			holes_markup += `<div class='hole' style='top:${hole.y}px;left:${hole.x}px;' data-id='${hole.id}'>
				<div class='point'></div>
			</div>`
		});

		holes.html(holes_markup);
		// let lastclicktime;
		holes.find('.hole').bind('click', function() {
			
			// const currenttime = (new Date())*1;
			// if(typeof lastclicktime === 'undefined' || (currenttime - lastclicktime) >= 2000)
			// {
			// 	lastclicktime = currenttime;

				let hole_el = $(this);

				hole_el.siblings('.selected').removeClass('selected');
				hole_el.addClass('selected');
				
				const holeid = hole_el.data('id');

				socket.emit('holeselected', holeid);
			// }
			// else
			// {
			// 	e.preventDefault();
			// }

		});

	});

	socket.on('holeunselect', id => {
		holes.find('.hole.selected[data-id="'+id+'"]').removeClass('selected');
	});

});


document.ontouchmove = function(event){
    event.preventDefault();
}