<?php
/* Copyright (c) 2013 C & P Bibliography Services
 *
 * This file is part of Biblionarrator.
 *
 * Biblionarrator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

class Create_RecordTypes_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        DB::query('set foreign_key_checks = 0;');
        Schema::table('recordtypes', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('name');
            $table->string('description');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
        Schema::table('records', function($table) {
            $table->integer('recordtype_id')->unsigned();
            $table->foreign('recordtype_id')->references('id')->on('recordtype');
        });
        DB::query('set foreign_key_checks = 1;');
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('recordtypes');
	}

}
