import $ from 'jquery'
import './styles/common.css'
import './styles/screen.css'

import io from 'socket.io-client';

let root_el = $('#root');

let hole_info_el;
let video_el;
let tipimg_el;
const show_hole_info = (hole, endcb) => {
	
	show_saver = false;
	
	if(typeof hole_info_el === 'undefined')
	{
		
		hole_info_el = $(
			`<div id="hole_info" data-currentholeid="${hole.id}">
				<div class="videowrapper"></div>
				<div class="tipimgwrapper"></div>
			</div>`
		);



		video_el = $(`
			<video class="video" src="/media/videos/${hole.video}" autoplay control="false"></video>`)
		tipimg_el = $(`<img class="tipimg" src="/media/tips/${hole.tipimg}"/>`)
		
		hole_info_el.find('.videowrapper').append(video_el);
		hole_info_el.find('.tipimgwrapper').append(tipimg_el);

		root_el.html(hole_info_el);
		
		tipimg_el.bind('load', function () {
			video_el.css({
				visibility:'visible',
				height: tipimg_el.height()+'px'
			})
		});
		
		video_el.bind('ended', () => {
			endcb && endcb()
			hole_info_el.css({
				display:'none'
			});
			show_saver = true;
		});
	}
	else
	{
		hole_info_el.css({
			display:'flex'
		});
		video_el.attr('src', `/media/videos/${hole.video}`);
		tipimg_el.attr('src', `/media/tips/${hole.tipimg}`);
	}
}

let show_saver = true;
let listofphotos = [];
let listofphotos_length = listofphotos.length;
let current_photo = 0;
const photo_anim_time = 7;
const logo_radius = 320;
const out_radius_koef = 1.8;

const run_saver = () => {

	const centerx = root_el.width()/2;
	const centery = root_el.height()/2;
	
	setInterval(() => {
		if(show_saver)
		{
			current_photo = (current_photo+1)%listofphotos_length;
			const photo = listofphotos[current_photo];
			if(typeof photo !== 'undefined')
			{
				let photo_el = $(`<img class='photo' src='/media/photos/${photo}'/>`);

				const angle = Math.random()*Math.PI*2;
				const rx = Math.cos(angle)*logo_radius;
				const ry = Math.sin(angle)*logo_radius;
				const outlogox = rx+centerx;
				const outlogoy = ry+centery;
				const outborderx = rx*out_radius_koef+centerx;
				const outbordery = ry*out_radius_koef+centery;

				photo_el.bind('load', ()=> {
					photo_el.css({
						// visibility: 'visible',
						top:outlogoy,
						left:outlogox,
						width: photo_el.width(),
						marginLeft: -photo_el.width()/2,
						height: photo_el.height(),
						marginTop: -photo_el.height()/2,
						transform: `scale(${1+(Math.random()*4-2)/10})`,
						animation: `opacity_wave ${photo_anim_time}s infinite`
					})

					photo_el.css({
						left:outborderx,
						top:outbordery,
						transition: `left ${photo_anim_time}s, top ${photo_anim_time}s`
					})

					photo_el.bind('transitionend', ()=>{
						photo_el.remove();
					});
				})
				root_el.append(photo_el);
			}
		}

	}, 2000)
}

//узнать ip сервера
$.get('/serverip', (serverip) => {

	const socket = io('http://'+serverip);
	
	let listofholes = [];
	let listofholes_id_to_index = {};

	socket.on('listofholes', list => {
		listofholes = list;

		listofholes.forEach((hole, index)=>{
			listofholes_id_to_index[hole.id] = index;
		});
		
	});
	socket.on('holeselected', id => {
		const hole = typeof listofholes_id_to_index[id] !== 'undefined' && listofholes[listofholes_id_to_index[id]];
		show_hole_info(hole, () => {
			socket.emit('holeunselect', id);
		});
	});

	socket.on('listofphotos', list => {
		listofphotos = list;
		listofphotos_length = listofphotos.length;
	});

	run_saver();

});