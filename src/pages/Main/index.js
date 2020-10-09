/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import moment from 'moment';
import api from '../../services/api';

import logo from '../../assets/logo.png';

import { Container, Form } from './styles';
import CompareList from '../../components/CompareList';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryError: false,
    repositoryInput: '',
    repositories: [],
  };

  componentDidMount() {
    const repos = JSON.parse(localStorage.getItem('repositories'));
    if (repos != null) {
      this.setState({ repositories: repos });
    }
  }

  handleDeleteRepository = (id) => {
    this.setState({
      repositories: this.state.repositories.filter(repos => repos.id !== id),
    });

    localStorage.setItem('repositories', JSON.stringify(this.state.repositories));
  }

  handleRefreshRepository = async (id) => {
    const repos = this.state.repositories.find(rep => rep.id === id);

    try {
      const { data } = await api.get(`/repos/${repos.full_name}`);
      const lastcommit = moment(data.pushed_at).fromNow();

      data.lastCommit = lastcommit;

      this.setState({
        repositories: this.state.repositories.map(repo => (repo.id === data.id ? data : repo)),
      });

      localStorage.setItem('repositories', JSON.stringify(this.state.repositories));
    } catch (err) {
      this.setState({ repositoryError: true });
    }
  }

  handleAddRepository = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const response = await api.get(`/repos/${this.state.repositoryInput}`);
      const lastcommit = moment(response.data.pushed_at).fromNow();

      response.data.lastCommit = lastcommit;

      this.setState({
        repositoryInput: '',
        repositories: [...this.state.repositories, response.data],
      });

      localStorage.setItem('repositories', JSON.stringify(this.state.repositories));
    } catch (err) {
      this.setState({ repositoryError: true });
    } finally {
      this.setState({
        repositoryError: false,
        loading: false,
      });
    }
  };

  render() {
    return (
      <Container>
        <img src={logo} alt="Github Compare" />

        <Form withError={this.state.repositoryError} onSubmit={this.handleAddRepository}>
          <input
            type="text"
            placeholder="usuário/repositório"
            value={this.state.repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">{this.state.loading ? <i className="fa fa-spinner fa-pulse" /> : 'OK'}</button>
        </Form>

        <CompareList
          repositories={this.state.repositories}
          onDeleteClick={this.handleDeleteRepository}
          onRefreshClick={this.handleRefreshRepository}
        />
      </Container>
    );
  }
}
