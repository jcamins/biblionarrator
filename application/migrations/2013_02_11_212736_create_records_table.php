<?php

class Create_Records_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
    public function up() {
        Schema::table('records', function($table) {
            $table->create();
            $table->increments('id');
            $table->integer('recordtype_id')->unsigned();
            $table->foreign('recordtype_id')->references('id')->on('recordtype');
            $table->text('data');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
    }

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
    public function down() {
        Schema::drop('records');
    }

}
