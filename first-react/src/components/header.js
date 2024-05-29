import React, { Component } from 'react';
import "./index.css";


export default class header extends Component {
    render() {
        return (
            <>
                <header class="bg-white w-full h-[70px] rounded-[25px] mt-[20px] flex items-center justify-between relative">
                    <div class="ml-[36px] flex">
                        <span class="font-bold text-[36px] cursor-pointer">#</span>
                        <span class="font-bold text-[36px] cursor-pointer ">чат</span>
                        <span class="font-bold text-[36px] cursor-pointer text-red-400">ап</span>
                    </div>
                    <div class="mr-[36px]">
                        <nav>
                            <a href="./register.html"
                                class="text-[15px] font-medium bg-[#FFAFAF] px-[28px] pt-[10px] pb-[7px] rounded-[25px] hover:opacity-[0.8] duration-200">Регистрация</a>

                        </nav>
                    </div>
                </header>
            </>
        )
    }
}
