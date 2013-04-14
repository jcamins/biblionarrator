<?php

class Add_Settings {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('systemsettings', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('variable');
            $table->string('value');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
        Schema::table('collectionsettings', function($table) {
            $table->create();
            $table->increments('id');
            $table->integer('collection_id')->unsigned();
            $table->foreign('collection_id')->references('id')->on('collections');
            $table->string('variable');
            $table->string('value');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
        Schema::table('usersettings', function($table) {
            $table->create();
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')->references('id')->on('users');
            $table->string('variable');
            $table->string('value');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('systemsettings');
        Schema::drop('collectionsettings');
        Schema::drop('usersettings');
	}

}
